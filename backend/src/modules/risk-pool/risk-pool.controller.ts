import { Controller, Get, Post, Put, Body, Param, Query, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RiskPoolService } from './risk-pool.service';
import { RiskPool } from './schemas/risk-pool.schema';

@ApiTags('Risk Pool Management')
@Controller('risk-pool')
export class RiskPoolController {
  private readonly logger = new Logger(RiskPoolController.name);

  constructor(private readonly riskPoolService: RiskPoolService) {}

  @Post('pools')
  @ApiOperation({ summary: 'Create a new risk pool' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Risk pool created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid pool configuration' })
  async createRiskPool(@Body() poolData: Partial<RiskPool>) {
    this.logger.log(`Creating risk pool: ${poolData.name}`);
    return await this.riskPoolService.createRiskPool(poolData);
  }

  @Post('pools/:poolId/contributions/premium')
  @ApiOperation({ summary: 'Process premium contribution to risk pool' })
  @ApiParam({ name: 'poolId', description: 'Risk pool ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Premium contribution processed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Risk pool not found' })
  async processPremiumContribution(
    @Param('poolId') poolId: string,
    @Body() contributionData: {
      contributorAccountId: string;
      amount: number;
      policyId: string;
    }
  ) {
    this.logger.log(`Processing premium contribution: ${contributionData.amount} to pool ${poolId}`);
    return await this.riskPoolService.processPremiumContribution(
      poolId,
      contributionData.contributorAccountId,
      contributionData.amount,
      contributionData.policyId
    );
  }

  @Get('pools/:poolId/liquidity/check')
  @ApiOperation({ summary: 'Check liquidity sufficiency for a potential claim' })
  @ApiParam({ name: 'poolId', description: 'Risk pool ID' })
  @ApiQuery({ name: 'amount', description: 'Required liquidity amount' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Liquidity check completed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Risk pool not found' })
  async checkLiquiditySufficiency(
    @Param('poolId') poolId: string,
    @Query('amount') amount: number
  ) {
    this.logger.log(`Checking liquidity sufficiency: ${amount} for pool ${poolId}`);
    return await this.riskPoolService.checkLiquiditySufficiency(poolId, Number(amount));
  }

  @Post('pools/:poolId/liquidity/reserve')
  @ApiOperation({ summary: 'Reserve liquidity for a known claim' })
  @ApiParam({ name: 'poolId', description: 'Risk pool ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Liquidity reserved successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Insufficient liquidity available' })
  async reserveLiquidity(
    @Param('poolId') poolId: string,
    @Body() reserveData: {
      amount: number;
      claimId: string;
    }
  ) {
    this.logger.log(`Reserving liquidity: ${reserveData.amount} for claim ${reserveData.claimId}`);
    return await this.riskPoolService.reserveLiquidity(poolId, reserveData.amount, reserveData.claimId);
  }

  @Post('pools/:poolId/liquidity/release')
  @ApiOperation({ summary: 'Release reserved liquidity' })
  @ApiParam({ name: 'poolId', description: 'Risk pool ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Liquidity released successfully' })
  async releaseLiquidity(
    @Param('poolId') poolId: string,
    @Body() releaseData: {
      amount: number;
      claimId: string;
      wasUsed: boolean;
    }
  ) {
    this.logger.log(`Releasing liquidity: ${releaseData.amount} for claim ${releaseData.claimId}`);
    return await this.riskPoolService.releaseLiquidity(
      poolId, 
      releaseData.amount, 
      releaseData.claimId, 
      releaseData.wasUsed
    );
  }

  @Post('pools/:poolId/stress-test')
  @ApiOperation({ summary: 'Perform stress testing on risk pool' })
  @ApiParam({ name: 'poolId', description: 'Risk pool ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Stress test completed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Risk pool not found' })
  async performStressTesting(@Param('poolId') poolId: string) {
    this.logger.log(`Performing stress testing for pool: ${poolId}`);
    return await this.riskPoolService.performStressTesting(poolId);
  }

  @Get('pools/:poolId/analytics')
  @ApiOperation({ summary: 'Get comprehensive analytics for a risk pool' })
  @ApiParam({ name: 'poolId', description: 'Risk pool ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pool analytics retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Risk pool not found' })
  async getPoolAnalytics(@Param('poolId') poolId: string) {
    this.logger.log(`Generating analytics for pool: ${poolId}`);
    return await this.riskPoolService.getPoolAnalytics(poolId);
  }

  @Get('pools')
  @ApiOperation({ summary: 'Get list of risk pools' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by pool status' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by pool type' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results to return' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Risk pool list retrieved successfully' })
  async getRiskPools(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: number
  ) {
    // Mock response - implementation would query actual pools
    return {
      pools: [
        {
          poolId: 'POOL001',
          name: 'Weather Risk Pool',
          type: 'weather',
          status: 'active',
          currentCapacity: 750000,
          targetCapacity: 1000000,
          availableLiquidity: 450000,
          utilizationRate: 0.75,
          performanceMetrics: {
            lossRatio: 0.45,
            combinedRatio: 0.89,
            returnOnCapital: 0.12
          }
        },
        {
          poolId: 'POOL002',
          name: 'Catastrophe Risk Pool',
          type: 'catastrophe',
          status: 'active',
          currentCapacity: 2500000,
          targetCapacity: 3000000,
          availableLiquidity: 1850000,
          utilizationRate: 0.83,
          performanceMetrics: {
            lossRatio: 0.38,
            combinedRatio: 0.82,
            returnOnCapital: 0.15
          }
        }
      ],
      totalCount: 2,
      filters: { status, type, limit }
    };
  }

  @Get('pools/:poolId/contributions')
  @ApiOperation({ summary: 'Get contribution history for a risk pool' })
  @ApiParam({ name: 'poolId', description: 'Risk pool ID' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by contribution type' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for history' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for history' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Contribution history retrieved successfully' })
  async getContributionHistory(
    @Param('poolId') poolId: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    // Mock contribution history
    return {
      poolId,
      contributions: [
        {
          contributionId: 'CONT001',
          contributorAccountId: '0.0.123456',
          type: 'premium',
          amount: 5000,
          netContribution: 4950,
          contributionDate: new Date(),
          status: 'allocated',
          policyId: 'POL789012'
        },
        {
          contributionId: 'CONT002',
          contributorAccountId: '0.0.789012',
          type: 'capital_injection',
          amount: 100000,
          netContribution: 99500,
          contributionDate: new Date(),
          status: 'allocated'
        }
      ],
      summary: {
        totalContributions: 2,
        totalAmount: 105000,
        totalNetContribution: 104450,
        averageContribution: 52500
      },
      filters: { type, startDate, endDate }
    };
  }

  @Get('pools/:poolId/liquidity-positions')
  @ApiOperation({ summary: 'Get liquidity positions for a risk pool' })
  @ApiParam({ name: 'poolId', description: 'Risk pool ID' })
  @ApiQuery({ name: 'tier', required: false, description: 'Filter by liquidity tier' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Liquidity positions retrieved successfully' })
  async getLiquidityPositions(
    @Param('poolId') poolId: string,
    @Query('tier') tier?: string
  ) {
    // Mock liquidity positions
    return {
      poolId,
      positions: [
        {
          positionId: 'POS001',
          positionType: 'cash',
          liquidityTier: 'tier_1',
          currentValue: 250000,
          availableAmount: 250000,
          currency: 'HBAR',
          lastValuationDate: new Date()
        },
        {
          positionId: 'POS002',
          positionType: 'short_term_investment',
          liquidityTier: 'tier_2',
          currentValue: 150000,
          availableAmount: 140000,
          encumberedAmount: 10000,
          currency: 'HBAR',
          yieldRate: 0.025,
          maturityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          lastValuationDate: new Date()
        }
      ],
      summary: {
        totalValue: 400000,
        totalAvailable: 390000,
        totalEncumbered: 10000,
        liquidityByTier: {
          tier_1: 250000,
          tier_2: 140000,
          tier_3: 0,
          tier_4: 0
        }
      },
      filters: { tier }
    };
  }

  @Get('analytics/dashboard')
  @ApiOperation({ summary: 'Get risk pool management dashboard analytics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dashboard analytics retrieved successfully' })
  async getDashboardAnalytics() {
    // Mock dashboard analytics
    return {
      systemOverview: {
        totalPools: 5,
        activePools: 4,
        totalCapacity: 5750000,
        totalLiquidity: 3200000,
        averageUtilization: 0.78,
        systemHealthScore: 0.92
      },
      performanceMetrics: {
        aggregateLossRatio: 0.42,
        aggregateCombinedRatio: 0.86,
        averageReturnOnCapital: 0.13,
        totalPremiumsCollected: 2100000,
        totalClaimsPaid: 882000
      },
      riskMetrics: {
        concentrationRisk: 0.15,
        diversificationScore: 0.85,
        averageSolvencyRatio: 1.68,
        stressTestPassRate: 0.80
      },
      liquidityMetrics: {
        systemLiquidity: 3200000,
        liquidityUtilization: 0.65,
        averageLiquidationTime: 5.2, // days
        emergencyFundingAvailable: 500000
      },
      trends: {
        monthlyPremiums: [180000, 195000, 175000, 220000],
        monthlyClaims: [78000, 85000, 72000, 95000],
        monthlyLiquidity: [3100000, 3150000, 3180000, 3200000]
      },
      timestamp: new Date()
    };
  }

  @Get('pools/:poolId/solvency-report')
  @ApiOperation({ summary: 'Get solvency report for a specific risk pool' })
  @ApiParam({ name: 'poolId', description: 'Risk pool ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Solvency report retrieved successfully' })
  async getSolvencyReport(@Param('poolId') poolId: string) {
    // Mock solvency report
    return {
      poolId,
      reportDate: new Date(),
      solvencyMetrics: {
        totalAssets: 1000000,
        totalLiabilities: 650000,
        netAssets: 350000,
        solvencyRatio: 1.54,
        minimumCapitalRequirement: 200000,
        surplusCapital: 150000,
        riskBasedCapital: 180000
      },
      riskAssessment: {
        underwritingRisk: 0.15,
        marketRisk: 0.08,
        creditRisk: 0.05,
        operationalRisk: 0.03,
        liquidityRisk: 0.04,
        concentrationRisk: 0.12
      },
      stressTestResults: {
        baselineScenario: { passedTest: true, surplusRatio: 0.54 },
        adverseScenario: { passedTest: true, surplusRatio: 0.23 },
        severeScenario: { passedTest: false, surplusRatio: -0.08 }
      },
      regulatoryCompliance: {
        minimumSolvencyRatio: 1.50,
        currentRatio: 1.54,
        isCompliant: true,
        nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        recommendations: [
          'Maintain current capital levels',
          'Monitor concentration risk in weather perils',
          'Consider additional reinsurance for catastrophic events'
        ]
      }
    };
  }
}
