import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReinsurerContract, ReinsurerContractDocument, ContractStatus } from './schemas/reinsurer-contract.schema';
import { CessionTransaction, CessionTransactionDocument, CessionStatus, CessionType } from './schemas/cession-transaction.schema';
import { ReinsuranceRecovery, ReinsuranceRecoveryDocument, RecoveryStatus, RecoveryType } from './schemas/reinsurance-recovery.schema';
import { TreatyManagement, TreatyManagementDocument } from './schemas/treaty-management.schema';

@Injectable()
export class ReinsuranceService {
  private readonly logger = new Logger(ReinsuranceService.name);

  constructor(
    @InjectModel(ReinsurerContract.name) private contractModel: Model<ReinsurerContractDocument>,
    @InjectModel(CessionTransaction.name) private cessionModel: Model<CessionTransactionDocument>,
    @InjectModel(ReinsuranceRecovery.name) private recoveryModel: Model<ReinsuranceRecoveryDocument>,
    @InjectModel(TreatyManagement.name) private treatyModel: Model<TreatyManagementDocument>,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * Process automated cession to reinsurer as shown in diagram
   */
  async processAutomatedCession(
    policyId: string,
    claimAmount: number,
    payoutId: string
  ): Promise<CessionTransactionDocument[]> {
    this.logger.log(`Processing automated cession for claim: ${claimAmount} on policy ${policyId}`);

    // Find applicable reinsurance contracts for this policy
    const contracts = await this.findApplicableContracts(policyId, claimAmount);
    
    if (contracts.length === 0) {
      this.logger.warn(`No applicable reinsurance contracts found for policy ${policyId}`);
      return [];
    }

    const cessionTransactions: CessionTransactionDocument[] = [];

    // Process cession for each applicable contract
    for (const contract of contracts) {
      try {
        const cession = await this.createCessionTransaction(
          contract,
          policyId,
          claimAmount,
          payoutId,
          CessionType.CLAIM_RECOVERY
        );

        // Execute the cession
        await this.executeCession(cession);
        cessionTransactions.push(cession);

      } catch (error) {
        this.logger.error(`Failed to process cession for contract ${contract.contractId}: ${error.message}`);
      }
    }

    return cessionTransactions;
  }

  /**
   * Find applicable reinsurance contracts for a policy
   */
  private async findApplicableContracts(
    policyId: string,
    claimAmount: number
  ): Promise<ReinsurerContractDocument[]> {
    // In a real implementation, this would check policy details against contract terms
    // For now, return active contracts that can handle the claim amount
    return await this.contractModel.find({
      status: ContractStatus.ACTIVE,
      'riskLimits.maxSingleRisk': { $gte: claimAmount },
      effectiveDate: { $lte: new Date() },
      expirationDate: { $gte: new Date() }
    });
  }

  /**
   * Create cession transaction record
   */
  private async createCessionTransaction(
    contract: ReinsurerContractDocument,
    policyId: string,
    claimAmount: number,
    payoutId: string,
    cessionType: CessionType
  ): Promise<CessionTransactionDocument> {
    
    // Calculate cession amounts based on treaty terms
    const calculation = this.calculateCessionAmounts(contract, claimAmount);
    
    const cession = new this.cessionModel({
      cessionId: this.generateCessionId(),
      contractId: contract.contractId,
      reinsurerId: contract.reinsurerId,
      policyId,
      payoutId,
      cessionType,
      status: CessionStatus.INITIATED,
      cessionCalculation: calculation,
      validationChecks: {
        contractValidation: true,
        amountValidation: calculation.netCessionAmount > 0,
        limitValidation: this.validateContractLimits(contract, calculation.netCessionAmount),
        walletValidation: false, // Will be validated during execution
        regulatoryValidation: false,
        fraudDetection: false
      },
      initiatedTimestamp: new Date(),
      initiatedBy: 'automated_system',
      riskData: {
        originalExposure: claimAmount,
        cededExposure: calculation.netCessionAmount,
        retainedExposure: calculation.retainedAmount,
        riskCategory: 'parametric_insurance',
        perilType: 'weather', // Would be derived from policy
        geographicLocation: 'global' // Would be derived from policy
      },
      automaticTriggers: {
        triggeredByPolicy: false,
        triggeredByClaim: true,
        triggeredByThreshold: false,
        triggerCondition: 'claim_recovery',
        triggerTimestamp: new Date()
      }
    });

    const savedCession = await cession.save();

    this.eventEmitter.emit('cession.initiated', {
      cessionId: savedCession.cessionId,
      contractId: contract.contractId,
      amount: calculation.netCessionAmount
    });

    return savedCession;
  }

  /**
   * Calculate cession amounts based on treaty terms
   */
  private calculateCessionAmounts(contract: ReinsurerContractDocument, claimAmount: number): any {
    const { treatyTerms } = contract;
    const cessionPercentage = treatyTerms.cessionPercentage / 100;
    
    let applicableAmount = claimAmount;
    
    // Apply attachment point for excess of loss treaties
    if (treatyTerms.attachmentPoint && claimAmount > treatyTerms.attachmentPoint) {
      applicableAmount = claimAmount - treatyTerms.attachmentPoint;
    }

    // Apply limit if specified
    if (treatyTerms.limit && applicableAmount > treatyTerms.limit) {
      applicableAmount = treatyTerms.limit;
    }

    const grossCessionAmount = applicableAmount * cessionPercentage;
    const commissionAmount = grossCessionAmount * (treatyTerms.commissionRate / 100);
    const netCessionAmount = grossCessionAmount - commissionAmount;
    const retainedAmount = claimAmount - grossCessionAmount;

    return {
      grossAmount: claimAmount,
      cessionPercentage: treatyTerms.cessionPercentage,
      netCessionAmount,
      retainedAmount,
      commissionAmount,
      profitSharingAmount: 0, // Would be calculated based on profit sharing terms
      netPayableAmount: netCessionAmount,
      currency: contract.financialTerms.currency
    };
  }

  /**
   * Validate contract limits
   */
  private validateContractLimits(contract: ReinsurerContractDocument, cessionAmount: number): boolean {
    if (!contract.riskLimits) return true;
    
    return cessionAmount <= contract.riskLimits.maxSingleRisk;
  }

  /**
   * Execute cession transaction
   */
  private async executeCession(cession: CessionTransactionDocument): Promise<void> {
    this.logger.log(`Executing cession: ${cession.cessionId}`);

    try {
      // Update status to calculating
      await this.cessionModel.findByIdAndUpdate(cession._id, {
        status: CessionStatus.CALCULATED,
        calculatedTimestamp: new Date()
      });

      // Perform validations
      const contract = await this.contractModel.findOne({ contractId: cession.contractId });
      if (!contract) {
        throw new Error('Contract not found');
      }

      // Validate reinsurer wallet
      const walletValidation = await this.validateReinsurerWallet(contract.reinsurerWalletAddress);
      
      // Update validation checks
      await this.cessionModel.findByIdAndUpdate(cession._id, {
        'validationChecks.walletValidation': walletValidation,
        'validationChecks.regulatoryValidation': true, // Mock validation
        'validationChecks.fraudDetection': true, // Mock validation
        status: CessionStatus.APPROVED,
        approvedTimestamp: new Date(),
        approvedBy: 'automated_system'
      });

      // Execute HTS transaction
      if (cession.cessionCalculation.netPayableAmount > 0) {
        const htsResult = await this.executeHTSCession(
          cession.cessionCalculation.netPayableAmount,
          contract.reinsurerWalletAddress,
          cession.cessionId
        );

        // Update cession with HTS details
        await this.cessionModel.findByIdAndUpdate(cession._id, {
          status: CessionStatus.COMPLETED,
          executedTimestamp: new Date(),
          completedTimestamp: new Date(),
          executedBy: 'automated_system',
          htsDetails: htsResult
        });

        this.eventEmitter.emit('cession.completed', {
          cessionId: cession.cessionId,
          contractId: cession.contractId,
          amount: cession.cessionCalculation.netPayableAmount,
          htsTransactionId: htsResult.transactionId
        });
      }

    } catch (error) {
      this.logger.error(`Cession execution failed: ${error.message}`);
      
      await this.cessionModel.findByIdAndUpdate(cession._id, {
        status: CessionStatus.FAILED,
        failureReason: error.message,
        failureMessage: error.toString()
      });

      this.eventEmitter.emit('cession.failed', {
        cessionId: cession.cessionId,
        reason: error.message
      });
    }
  }

  /**
   * Validate reinsurer wallet
   */
  private async validateReinsurerWallet(walletAddress: string): Promise<boolean> {
    // Mock wallet validation - in real implementation would validate with Hedera
    return walletAddress && walletAddress.startsWith('0.0.');
  }

  /**
   * Execute HTS cession transaction
   */
  private async executeHTSCession(amount: number, toAddress: string, memo: string): Promise<any> {
    // Mock HTS transaction - in real implementation would use Hedera SDK
    const mockTransactionId = `0.0.${Date.now()}@${Date.now()}.${Math.floor(Math.random() * 999999999)}`;
    
    return {
      transactionId: mockTransactionId,
      fromAccount: '0.0.riskpool',
      toAccount: toAddress,
      tokenId: '0.0.123456',
      amount,
      consensusTimestamp: new Date(),
      transactionFee: 0.001,
      memo,
      finalityConfirmations: 5000
    };
  }

  /**
   * Create reinsurance contract
   */
  async createReinsurerContract(contractData: Partial<ReinsurerContract>): Promise<ReinsurerContractDocument> {
    this.logger.log(`Creating reinsurance contract for reinsurer: ${contractData.reinsurerName}`);

    const contract = new this.contractModel({
      ...contractData,
      contractId: this.generateContractId(),
      status: ContractStatus.ACTIVE
    });

    const savedContract = await contract.save();

    this.eventEmitter.emit('contract.created', {
      contractId: savedContract.contractId,
      reinsurerId: savedContract.reinsurerId
    });

    return savedContract;
  }

  /**
   * Submit reinsurance recovery claim
   */
  async submitRecoveryCllaim(
    contractId: string,
    claimId: string,
    policyId: string,
    claimAmount: number,
    recoveryType: RecoveryType
  ): Promise<ReinsuranceRecoveryDocument> {
    this.logger.log(`Submitting recovery claim: ${claimAmount} for contract ${contractId}`);

    const contract = await this.contractModel.findOne({ contractId });
    if (!contract) {
      throw new Error('Contract not found');
    }

    const recoveryCalculation = this.calculateRecoveryAmount(contract, claimAmount);

    const recovery = new this.recoveryModel({
      recoveryId: this.generateRecoveryId(),
      contractId,
      reinsurerId: contract.reinsurerId,
      claimId,
      policyId,
      recoveryType,
      status: RecoveryStatus.SUBMITTED,
      recoveryCalculation,
      submissionDate: new Date()
    });

    const savedRecovery = await recovery.save();

    this.eventEmitter.emit('recovery.submitted', {
      recoveryId: savedRecovery.recoveryId,
      contractId,
      amount: recoveryCalculation.netRecovery
    });

    return savedRecovery;
  }

  /**
   * Calculate recovery amount
   */
  private calculateRecoveryAmount(contract: ReinsurerContractDocument, claimAmount: number): any {
    const { treatyTerms } = contract;
    const recoveryPercentage = treatyTerms.cessionPercentage / 100;
    
    let applicableAmount = claimAmount;
    
    // Apply deductible/attachment point
    if (treatyTerms.attachmentPoint) {
      applicableAmount = Math.max(0, claimAmount - treatyTerms.attachmentPoint);
    }

    const recoveryAmount = applicableAmount * recoveryPercentage;
    const netRecovery = recoveryAmount; // After any deductions

    return {
      totalClaimAmount: claimAmount,
      applicableAmount,
      deductibleAmount: treatyTerms.attachmentPoint || 0,
      recoveryAmount,
      reinsurerShare: treatyTerms.cessionPercentage,
      netRecovery,
      currency: contract.financialTerms.currency
    };
  }

  /**
   * Get cession analytics
   */
  async getCessionAnalytics(contractId?: string): Promise<any> {
    const filter = contractId ? { contractId } : {};
    
    const cessions = await this.cessionModel.find(filter);
    const totalCessions = cessions.length;
    const completedCessions = cessions.filter(c => c.status === CessionStatus.COMPLETED).length;
    const totalAmount = cessions.reduce((sum, c) => sum + c.cessionCalculation.netPayableAmount, 0);

    return {
      totalCessions,
      completedCessions,
      successRate: totalCessions > 0 ? completedCessions / totalCessions : 0,
      totalAmount,
      averageAmount: totalCessions > 0 ? totalAmount / totalCessions : 0,
      cessionsByType: this.groupCessionsByType(cessions),
      monthlyTrends: this.calculateMonthlyTrends(cessions),
      timestamp: new Date()
    };
  }

  // Helper methods
  private generateCessionId(): string {
    return `CES${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }

  private generateContractId(): string {
    return `CON${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }

  private generateRecoveryId(): string {
    return `REC${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }

  private groupCessionsByType(cessions: CessionTransactionDocument[]): Record<string, number> {
    return cessions.reduce((acc, cession) => {
      acc[cession.cessionType] = (acc[cession.cessionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateMonthlyTrends(cessions: CessionTransactionDocument[]): any[] {
    // Simplified monthly trends calculation
    const monthlyData = cessions.reduce((acc, cession) => {
      const month = cession.initiatedTimestamp.toISOString().substr(0, 7);
      if (!acc[month]) {
        acc[month] = { count: 0, amount: 0 };
      }
      acc[month].count += 1;
      acc[month].amount += cession.cessionCalculation.netPayableAmount;
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      count: data.count,
      amount: data.amount
    }));
  }
}
