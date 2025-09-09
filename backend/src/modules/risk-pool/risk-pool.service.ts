import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RiskPool, RiskPoolDocument, PoolStatus } from './schemas/risk-pool.schema';
import { PoolContribution, PoolContributionDocument, ContributionStatus, ContributionType } from './schemas/pool-contribution.schema';
import { LiquidityPosition, LiquidityPositionDocument, LiquidityTier } from './schemas/liquidity-position.schema';

@Injectable()
export class RiskPoolService {
  private readonly logger = new Logger(RiskPoolService.name);

  constructor(
    @InjectModel(RiskPool.name) private riskPoolModel: Model<RiskPoolDocument>,
    @InjectModel(PoolContribution.name) private contributionModel: Model<PoolContributionDocument>,
    @InjectModel(LiquidityPosition.name) private liquidityModel: Model<LiquidityPositionDocument>,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * Create a new risk pool
   */
  async createRiskPool(poolData: Partial<RiskPool>): Promise<RiskPoolDocument> {
    this.logger.log(`Creating new risk pool: ${poolData.name}`);
    
    const pool = new this.riskPoolModel({
      ...poolData,
      poolId: this.generatePoolId(),
      currentCapacity: 0,
      availableLiquidity: 0,
      reservedLiquidity: 0,
      status: PoolStatus.ACTIVE,
      inceptionDate: new Date(),
      performanceMetrics: {
        inception: new Date(),
        totalPremiums: 0,
        totalClaims: 0,
        lossRatio: 0,
        combinedRatio: 0,
        returnOnCapital: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        volatility: 0
      }
    });

    const savedPool = await pool.save();
    
    this.eventEmitter.emit('risk_pool.created', { poolId: savedPool.poolId, pool: savedPool });
    
    return savedPool;
  }

  /**
   * Process premium contribution to risk pool
   */
  async processPremiumContribution(
    poolId: string,
    contributorAccountId: string,
    amount: number,
    policyId: string
  ): Promise<PoolContributionDocument> {
    this.logger.log(`Processing premium contribution: ${amount} to pool ${poolId}`);
    
    const pool = await this.riskPoolModel.findOne({ poolId });
    if (!pool) {
      throw new Error(`Risk pool ${poolId} not found`);
    }

    // Calculate fees
    const feeCalculation = this.calculateContributionFees(amount, pool.feeStructure);
    
    // Create contribution record
    const contribution = new this.contributionModel({
      contributionId: this.generateContributionId(),
      poolId,
      contributorAccountId,
      contributionType: ContributionType.PREMIUM,
      status: ContributionStatus.PENDING,
      amount,
      currency: 'HBAR', // Default to HBAR
      contributionDate: new Date(),
      policyId,
      feeCalculation,
      allocationBreakdown: this.calculateAllocationBreakdown(feeCalculation.netContribution, pool)
    });

    const savedContribution = await contribution.save();
    
    // Process the contribution
    await this.allocateContribution(savedContribution, pool);
    
    this.eventEmitter.emit('premium.contributed', {
      poolId,
      contributionId: savedContribution.contributionId,
      amount: feeCalculation.netContribution
    });
    
    return savedContribution;
  }

  /**
   * Allocate contribution to pool and update liquidity positions
   */
  async allocateContribution(contribution: PoolContributionDocument, pool: RiskPoolDocument): Promise<void> {
    this.logger.log(`Allocating contribution: ${contribution.contributionId}`);
    
    const { allocationBreakdown } = contribution;
    if (!allocationBreakdown) {
      throw new Error('Allocation breakdown not found');
    }

    // Update pool capacity and liquidity
    pool.currentCapacity += contribution.feeCalculation.netContribution;
    pool.availableLiquidity += allocationBreakdown.liquidityReserve;
    
    await pool.save();

    // Create/update liquidity positions
    await this.updateLiquidityPositions(pool.poolId, allocationBreakdown);
    
    // Update contribution status
    await this.contributionModel.findByIdAndUpdate(contribution._id, {
      status: ContributionStatus.ALLOCATED,
      effectiveDate: new Date()
    });

    this.eventEmitter.emit('contribution.allocated', {
      poolId: pool.poolId,
      contributionId: contribution.contributionId,
      newCapacity: pool.currentCapacity
    });
  }

  /**
   * Check liquidity sufficiency for a potential claim
   */
  async checkLiquiditySufficiency(poolId: string, requiredAmount: number): Promise<any> {
    this.logger.log(`Checking liquidity sufficiency: ${requiredAmount} for pool ${poolId}`);
    
    const pool = await this.riskPoolModel.findOne({ poolId });
    if (!pool) {
      throw new Error(`Risk pool ${poolId} not found`);
    }

    const liquidityPositions = await this.liquidityModel.find({ poolId });
    
    // Calculate available liquidity by tier
    const liquidityByTier = this.calculateLiquidityByTier(liquidityPositions);
    
    // Check immediate liquidity (Tier 1)
    const immediatelyAvailable = liquidityByTier[LiquidityTier.TIER_1] || 0;
    const shortTermAvailable = (liquidityByTier[LiquidityTier.TIER_2] || 0) + immediatelyAvailable;
    const totalAvailable = pool.availableLiquidity;
    
    const liquidityCheck = {
      requiredAmount,
      immediatelyAvailable,
      shortTermAvailable,
      totalAvailable,
      hasSufficientLiquidity: totalAvailable >= requiredAmount,
      hasImmediateLiquidity: immediatelyAvailable >= requiredAmount,
      liquidityGap: Math.max(0, requiredAmount - totalAvailable),
      liquidationTimeEstimate: this.estimateLiquidationTime(requiredAmount, liquidityByTier),
      timestamp: new Date()
    };

    // Emit liquidity check event
    this.eventEmitter.emit('liquidity.checked', {
      poolId,
      liquidityCheck
    });

    return liquidityCheck;
  }

  /**
   * Reserve liquidity for a known claim
   */
  async reserveLiquidity(poolId: string, amount: number, claimId: string): Promise<void> {
    this.logger.log(`Reserving liquidity: ${amount} for claim ${claimId} in pool ${poolId}`);
    
    const pool = await this.riskPoolModel.findOne({ poolId });
    if (!pool) {
      throw new Error(`Risk pool ${poolId} not found`);
    }

    if (pool.availableLiquidity < amount) {
      throw new Error('Insufficient available liquidity to reserve');
    }

    // Update pool liquidity
    pool.availableLiquidity -= amount;
    pool.reservedLiquidity += amount;
    
    await pool.save();

    this.eventEmitter.emit('liquidity.reserved', {
      poolId,
      amount,
      claimId,
      newAvailableLiquidity: pool.availableLiquidity
    });
  }

  /**
   * Release reserved liquidity (e.g., claim rejected or paid)
   */
  async releaseLiquidity(poolId: string, amount: number, claimId: string, wasUsed: boolean = false): Promise<void> {
    this.logger.log(`Releasing liquidity: ${amount} for claim ${claimId} in pool ${poolId}`);
    
    const pool = await this.riskPoolModel.findOne({ poolId });
    if (!pool) {
      throw new Error(`Risk pool ${poolId} not found`);
    }

    if (!wasUsed) {
      // Return to available liquidity
      pool.availableLiquidity += amount;
    }
    
    pool.reservedLiquidity -= amount;
    
    await pool.save();

    this.eventEmitter.emit('liquidity.released', {
      poolId,
      amount,
      claimId,
      wasUsed,
      newAvailableLiquidity: pool.availableLiquidity
    });
  }

  /**
   * Perform stress testing on risk pool
   */
  async performStressTesting(poolId: string): Promise<any> {
    this.logger.log(`Performing stress testing for pool: ${poolId}`);
    
    const pool = await this.riskPoolModel.findOne({ poolId });
    if (!pool) {
      throw new Error(`Risk pool ${poolId} not found`);
    }

    const liquidityPositions = await this.liquidityModel.find({ poolId });
    
    // Define stress scenarios
    const stressScenarios = [
      { name: '1-in-10 Year Event', claimRatio: 0.20, liquidityStress: 0.10 },
      { name: '1-in-25 Year Event', claimRatio: 0.35, liquidityStress: 0.15 },
      { name: '1-in-50 Year Event', claimRatio: 0.50, liquidityStress: 0.20 },
      { name: '1-in-100 Year Event', claimRatio: 0.75, liquidityStress: 0.25 }
    ];

    const stressResults = stressScenarios.map(scenario => {
      const stressedClaims = pool.currentCapacity * scenario.claimRatio;
      const stressedLiquidity = pool.availableLiquidity * (1 - scenario.liquidityStress);
      
      return {
        scenarioName: scenario.name,
        stressedClaims,
        availableLiquidity: stressedLiquidity,
        liquidityShortfall: Math.max(0, stressedClaims - stressedLiquidity),
        passedTest: stressedLiquidity >= stressedClaims,
        capitalBuffer: stressedLiquidity - stressedClaims,
        bufferRatio: (stressedLiquidity - stressedClaims) / stressedClaims
      };
    });

    const overallResults = {
      poolId,
      testTimestamp: new Date(),
      scenarios: stressResults,
      overallRating: this.calculateStressTestRating(stressResults),
      recommendations: this.generateStressTestRecommendations(stressResults),
      nextTestDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    };

    this.eventEmitter.emit('stress_test.completed', overallResults);
    
    return overallResults;
  }

  /**
   * Get pool performance analytics
   */
  async getPoolAnalytics(poolId: string): Promise<any> {
    this.logger.log(`Generating analytics for pool: ${poolId}`);
    
    const pool = await this.riskPoolModel.findOne({ poolId });
    if (!pool) {
      throw new Error(`Risk pool ${poolId} not found`);
    }

    const contributions = await this.contributionModel.find({ poolId, status: ContributionStatus.ALLOCATED });
    const liquidityPositions = await this.liquidityModel.find({ poolId });
    
    // Calculate key metrics
    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
    const premiumContributions = contributions.filter(c => c.contributionType === ContributionType.PREMIUM);
    const totalPremiums = premiumContributions.reduce((sum, c) => sum + c.amount, 0);
    
    const analytics = {
      poolOverview: {
        poolId,
        name: pool.name,
        type: pool.poolType,
        status: pool.status,
        inception: pool.inceptionDate,
        currentCapacity: pool.currentCapacity,
        targetCapacity: pool.targetCapacity,
        utilizationRate: pool.currentCapacity / pool.targetCapacity
      },
      financialMetrics: {
        totalContributions,
        totalPremiums,
        availableLiquidity: pool.availableLiquidity,
        reservedLiquidity: pool.reservedLiquidity,
        liquidityRatio: pool.availableLiquidity / pool.currentCapacity,
        performanceMetrics: pool.performanceMetrics
      },
      riskMetrics: {
        riskParameters: pool.riskParameters,
        concentrationAnalysis: this.analyzeConcentrationRisk(contributions),
        diversificationScore: this.calculateDiversificationScore(contributions)
      },
      liquidityAnalysis: {
        positionsByTier: this.calculateLiquidityByTier(liquidityPositions),
        liquidityManagement: pool.liquidityManagement,
        averageMaturity: this.calculateAverageLiquidityMaturity(liquidityPositions)
      },
      timestamp: new Date()
    };

    return analytics;
  }

  // Helper methods
  private generatePoolId(): string {
    return `POOL${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }

  private generateContributionId(): string {
    return `CONT${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }

  private calculateContributionFees(amount: number, feeStructure: any): any {
    const managementFee = feeStructure?.managementFee || 0.005; // 0.5% default
    const entryFee = feeStructure?.entryFee || 0.001; // 0.1% default
    
    const managementFeeAmount = amount * managementFee;
    const entryFeeAmount = amount * entryFee;
    const totalFees = managementFeeAmount + entryFeeAmount;
    const netContribution = amount - totalFees;
    
    return {
      grossAmount: amount,
      managementFee: managementFeeAmount,
      entryFee: entryFeeAmount,
      netContribution,
      feePercentage: totalFees / amount
    };
  }

  private calculateAllocationBreakdown(amount: number, pool: RiskPoolDocument): any {
    // Standard allocation percentages
    const liquidityReserveRatio = 0.60;  // 60% to liquidity
    const investmentFundRatio = 0.25;    // 25% to investments
    const operationalReserveRatio = 0.08; // 8% to operations
    const regulatoryCapitalRatio = 0.05;  // 5% to regulatory capital
    const contingencyReserveRatio = 0.02; // 2% to contingency
    
    return {
      liquidityReserve: amount * liquidityReserveRatio,
      investmentFund: amount * investmentFundRatio,
      operationalReserve: amount * operationalReserveRatio,
      regulatoryCapital: amount * regulatoryCapitalRatio,
      contingencyReserve: amount * contingencyReserveRatio
    };
  }

  private async updateLiquidityPositions(poolId: string, allocation: any): Promise<void> {
    // Update or create cash position (Tier 1)
    await this.liquidityModel.findOneAndUpdate(
      { poolId, positionType: 'cash', liquidityTier: LiquidityTier.TIER_1 },
      {
        $inc: { 
          currentValue: allocation.liquidityReserve,
          availableAmount: allocation.liquidityReserve
        },
        lastValuationDate: new Date()
      },
      { upsert: true }
    );
    
    // Additional position updates would go here...
  }

  private calculateLiquidityByTier(positions: LiquidityPositionDocument[]): Record<string, number> {
    return positions.reduce((acc, position) => {
      acc[position.liquidityTier] = (acc[position.liquidityTier] || 0) + position.availableAmount;
      return acc;
    }, {} as Record<string, number>);
  }

  private estimateLiquidationTime(requiredAmount: number, liquidityByTier: Record<string, number>): number {
    const tier1 = liquidityByTier[LiquidityTier.TIER_1] || 0;
    const tier2 = liquidityByTier[LiquidityTier.TIER_2] || 0;
    const tier3 = liquidityByTier[LiquidityTier.TIER_3] || 0;
    
    if (tier1 >= requiredAmount) return 0; // Immediate
    if (tier1 + tier2 >= requiredAmount) return 3; // 3 days average
    if (tier1 + tier2 + tier3 >= requiredAmount) return 15; // 15 days average
    return 30; // 30+ days
  }

  private calculateStressTestRating(results: any[]): string {
    const passedTests = results.filter(r => r.passedTest).length;
    const totalTests = results.length;
    const passRate = passedTests / totalTests;
    
    if (passRate >= 0.9) return 'A';
    if (passRate >= 0.75) return 'B';
    if (passRate >= 0.5) return 'C';
    return 'D';
  }

  private generateStressTestRecommendations(results: any[]): string[] {
    const recommendations = [];
    
    if (results.some(r => !r.passedTest)) {
      recommendations.push('Increase liquidity reserves');
      recommendations.push('Consider reinsurance coverage');
    }
    
    if (results.filter(r => r.passedTest).length < 3) {
      recommendations.push('Review risk parameters');
      recommendations.push('Implement stop-loss mechanisms');
    }
    
    return recommendations;
  }

  private analyzeConcentrationRisk(contributions: PoolContributionDocument[]): any {
    // Simplified concentration analysis
    const contributorConcentration = contributions.reduce((acc, c) => {
      acc[c.contributorAccountId] = (acc[c.contributorAccountId] || 0) + c.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0);
    const maxConcentration = Math.max(...Object.values(contributorConcentration)) / totalAmount;
    
    return {
      maxSingleContributor: maxConcentration,
      numberOfContributors: Object.keys(contributorConcentration).length,
      riskLevel: maxConcentration > 0.2 ? 'high' : maxConcentration > 0.1 ? 'medium' : 'low'
    };
  }

  private calculateDiversificationScore(contributions: PoolContributionDocument[]): number {
    // Simplified diversification score based on number of contributors
    const uniqueContributors = new Set(contributions.map(c => c.contributorAccountId)).size;
    return Math.min(1.0, uniqueContributors / 10); // Score of 1.0 at 10+ contributors
  }

  private calculateAverageLiquidityMaturity(positions: LiquidityPositionDocument[]): number {
    const positionsWithMaturity = positions.filter(p => p.maturityDate);
    if (positionsWithMaturity.length === 0) return 0;
    
    const now = new Date();
    const totalDays = positionsWithMaturity.reduce((sum, p) => {
      const days = Math.max(0, (p.maturityDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    
    return totalDays / positionsWithMaturity.length;
  }
}
