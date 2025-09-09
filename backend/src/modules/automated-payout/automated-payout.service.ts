import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PayoutTransaction, PayoutTransactionDocument, TransactionStatus, FailureReason } from './schemas/payout-transaction.schema';
import { LiquidityReservation, LiquidityReservationDocument, ReservationStatus, ReservationType } from './schemas/liquidity-reservation.schema';
import { BeneficiaryWallet, BeneficiaryWalletDocument, WalletStatus } from './schemas/beneficiary-wallet.schema';

@Injectable()
export class AutomatedPayoutService {
  private readonly logger = new Logger(AutomatedPayoutService.name);
  private readonly FINALITY_THRESHOLD = 5000; // >5k as per diagram
  private readonly MAX_RETRY_ATTEMPTS = 3;

  constructor(
    @InjectModel(PayoutTransaction.name) private payoutTransactionModel: Model<PayoutTransactionDocument>,
    @InjectModel(LiquidityReservation.name) private liquidityReservationModel: Model<LiquidityReservationDocument>,
    @InjectModel(BeneficiaryWallet.name) private beneficiaryWalletModel: Model<BeneficiaryWalletDocument>,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * Main payout request method as shown in diagram: requestPayout(policyId, payoutAmt)
   */
  async requestPayout(
    policyId: string,
    payoutAmount: number,
    triggerId: string,
    beneficiaryAccountId: string,
    poolId: string
  ): Promise<PayoutTransactionDocument> {
    this.logger.log(`Processing payout request: ${payoutAmount} for policy ${policyId}`);

    // Step 1: Create payout transaction record
    const transaction = await this.createPayoutTransaction(
      policyId,
      payoutAmount,
      triggerId,
      beneficiaryAccountId,
      poolId
    );

    // Step 2: Validate beneficiary wallet
    const walletValidation = await this.validateBeneficiaryWallet(beneficiaryAccountId);
    if (!walletValidation.isValid) {
      await this.failTransaction(transaction._id, FailureReason.WALLET_VALIDATION_FAILED, walletValidation.reason);
      return transaction;
    }

    // Step 3: Check pool liquidity (as per diagram)
    const liquidityCheck = await this.checkPoolLiquidity(poolId, payoutAmount);
    if (!liquidityCheck.hasLiquidity) {
      await this.failTransaction(transaction._id, FailureReason.INSUFFICIENT_LIQUIDITY, 'Pool lacks sufficient liquidity');
      return transaction;
    }

    // Step 4: Reserve liquidity
    const reservation = await this.reserveLiquidity(transaction._id.toString(), poolId, payoutAmount);
    
    // Step 5: Execute payout transfer
    await this.executePayoutTransfer(transaction, walletValidation.walletAddress, reservation);

    return transaction;
  }

  /**
   * Create initial payout transaction record
   */
  private async createPayoutTransaction(
    policyId: string,
    payoutAmount: number,
    triggerId: string,
    beneficiaryAccountId: string,
    poolId: string
  ): Promise<PayoutTransactionDocument> {
    const transaction = new this.payoutTransactionModel({
      transactionId: this.generateTransactionId(),
      policyId,
      triggerId,
      payoutId: `PAY_${Date.now()}`,
      beneficiaryAccountId,
      beneficiaryWalletAddress: '', // Will be filled after validation
      payoutAmount,
      currency: 'HBAR',
      status: TransactionStatus.INITIATED,
      liquidityDetails: {
        poolId,
        reservationId: '',
        reservedAmount: payoutAmount,
        reservationTimestamp: new Date(),
        utilizationRate: 0
      },
      initiatedTimestamp: new Date(),
      validationChecks: {
        policyValidation: true, // Assume validated by policy workflow
        beneficiaryValidation: false,
        liquidityValidation: false,
        regulatoryValidation: false,
        walletValidation: false
      },
      retryMechanism: {
        maxRetries: this.MAX_RETRY_ATTEMPTS,
        currentRetry: 0,
        retryDelayMs: 30000, // 30 seconds
        backoffMultiplier: 2
      }
    });

    const savedTransaction = await transaction.save();
    
    this.eventEmitter.emit('payout.initiated', {
      transactionId: savedTransaction.transactionId,
      policyId,
      amount: payoutAmount
    });

    return savedTransaction;
  }

  /**
   * Validate beneficiary wallet as per diagram requirements
   */
  private async validateBeneficiaryWallet(beneficiaryAccountId: string): Promise<{
    isValid: boolean;
    walletAddress?: string;
    reason?: string;
  }> {
    this.logger.log(`Validating beneficiary wallet for account: ${beneficiaryAccountId}`);

    const wallet = await this.beneficiaryWalletModel.findOne({ beneficiaryAccountId });
    
    if (!wallet) {
      return { isValid: false, reason: 'Wallet not registered' };
    }

    if (wallet.status !== WalletStatus.ACTIVE) {
      return { isValid: false, reason: `Wallet status is ${wallet.status}` };
    }

    if (!wallet.validation.isValidAddress || !wallet.validation.isActive) {
      return { isValid: false, reason: 'Wallet validation failed' };
    }

    if (!wallet.validation.kycCompleted || !wallet.validation.amlCleared) {
      return { isValid: false, reason: 'KYC/AML requirements not met' };
    }

    return {
      isValid: true,
      walletAddress: wallet.walletAddress
    };
  }

  /**
   * Check pool liquidity as shown in diagram
   */
  private async checkPoolLiquidity(poolId: string, requiredAmount: number): Promise<{
    hasLiquidity: boolean;
    availableAmount?: number;
    reason?: string;
  }> {
    this.logger.log(`Checking pool liquidity: ${requiredAmount} from pool ${poolId}`);

    // This would integrate with RiskPoolService to check actual liquidity
    // For now, implementing a mock check
    const mockPoolLiquidity = 1000000; // Mock available liquidity
    
    if (mockPoolLiquidity >= requiredAmount) {
      return {
        hasLiquidity: true,
        availableAmount: mockPoolLiquidity
      };
    }

    return {
      hasLiquidity: false,
      availableAmount: mockPoolLiquidity,
      reason: `Insufficient liquidity. Required: ${requiredAmount}, Available: ${mockPoolLiquidity}`
    };
  }

  /**
   * Reserve liquidity from pool
   */
  private async reserveLiquidity(
    transactionId: string,
    poolId: string,
    amount: number
  ): Promise<LiquidityReservationDocument> {
    this.logger.log(`Reserving liquidity: ${amount} from pool ${poolId}`);

    const reservation = new this.liquidityReservationModel({
      reservationId: this.generateReservationId(),
      poolId,
      transactionId,
      policyId: '', // Will be filled from transaction
      reservationType: ReservationType.PAYOUT_CLAIM,
      status: ReservationStatus.ACTIVE,
      reservedAmount: amount,
      currency: 'HBAR',
      reservationTimestamp: new Date(),
      expirationTimestamp: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      poolSnapshot: {
        totalLiquidity: 1000000,
        availableLiquidity: 800000,
        reservedLiquidity: 200000,
        utilizationRate: 0.2,
        liquidityTiers: {
          tier1: 500000,
          tier2: 250000,
          tier3: 150000,
          tier4: 100000
        }
      },
      liquiditySources: [{
        sourceId: 'cash_pool_1',
        sourceType: 'cash',
        amount: amount,
        liquidationTimeEstimate: 0, // Immediate
        liquidationCost: 0
      }],
      requestedBy: 'automated_payout_system'
    });

    const savedReservation = await reservation.save();

    // Update transaction with reservation details
    await this.payoutTransactionModel.findOneAndUpdate(
      { transactionId },
      {
        status: TransactionStatus.LIQUIDITY_RESERVED,
        'liquidityDetails.reservationId': savedReservation.reservationId,
        'validationChecks.liquidityValidation': true
      }
    );

    this.eventEmitter.emit('liquidity.reserved', {
      reservationId: savedReservation.reservationId,
      poolId,
      amount
    });

    return savedReservation;
  }

  /**
   * Execute payout transfer via HTS as per diagram
   */
  private async executePayoutTransfer(
    transaction: PayoutTransactionDocument,
    beneficiaryWalletAddress: string,
    reservation: LiquidityReservationDocument
  ): Promise<void> {
    this.logger.log(`Executing payout transfer: ${transaction.payoutAmount} to ${beneficiaryWalletAddress}`);

    try {
      // Update transaction status
      await this.payoutTransactionModel.findByIdAndUpdate(transaction._id, {
        status: TransactionStatus.EXECUTING,
        beneficiaryWalletAddress,
        'validationChecks.walletValidation': true
      });

      // Execute HTS transaction (mock implementation)
      const htsResult = await this.executeHTSTransaction(
        transaction.payoutAmount,
        beneficiaryWalletAddress,
        transaction.transactionId
      );

      // Update transaction with HTS details
      await this.payoutTransactionModel.findByIdAndUpdate(transaction._id, {
        status: TransactionStatus.COMPLETED,
        completedTimestamp: new Date(),
        htsDetails: htsResult,
        'feeStructure.networkFee': htsResult.transactionFee,
        'feeStructure.processingFee': 0,
        'feeStructure.totalFees': htsResult.transactionFee,
        'feeStructure.netPayout': transaction.payoutAmount - htsResult.transactionFee
      });

      // Wait for finality confirmation (>5k as per diagram)
      await this.waitForFinality(transaction.transactionId, htsResult.transactionId);

      // Release liquidity reservation
      await this.releaseLiquidityReservation(reservation.reservationId, true);

      this.eventEmitter.emit('payout.completed', {
        transactionId: transaction.transactionId,
        htsTransactionId: htsResult.transactionId,
        amount: transaction.payoutAmount,
        beneficiaryWalletAddress
      });

    } catch (error) {
      this.logger.error(`Payout transfer failed: ${error.message}`);
      await this.failTransaction(transaction._id, FailureReason.HTS_TRANSACTION_FAILED, error.message);
      
      // Release reservation on failure
      await this.releaseLiquidityReservation(reservation.reservationId, false);
    }
  }

  /**
   * Execute HTS transaction (mock implementation)
   */
  private async executeHTSTransaction(
    amount: number,
    toAddress: string,
    memo: string
  ): Promise<any> {
    // Mock HTS transaction - in real implementation would use Hedera SDK
    const mockTransactionId = `0.0.${Date.now()}@${Date.now()}.${Math.floor(Math.random() * 999999999)}`;
    
    return {
      transactionId: mockTransactionId,
      tokenId: '0.0.123456', // Mock token ID
      fromAccountId: '0.0.poolAccount',
      toAccountId: toAddress,
      amount,
      consensusTimestamp: new Date(),
      transactionFee: 0.001, // Mock fee
      memo,
      finalityConfirmations: 0,
      finalityThreshold: this.FINALITY_THRESHOLD
    };
  }

  /**
   * Wait for finality confirmation (>5k threshold as per diagram)
   */
  private async waitForFinality(transactionId: string, htsTransactionId: string): Promise<void> {
    this.logger.log(`Waiting for finality confirmation: ${htsTransactionId}`);

    // Mock finality confirmation - in real implementation would query Hedera network
    const mockConfirmations = this.FINALITY_THRESHOLD + 1000;
    
    await this.payoutTransactionModel.findOneAndUpdate(
      { transactionId },
      {
        finalityConfirmedTimestamp: new Date(),
        'htsDetails.finalityConfirmations': mockConfirmations
      }
    );

    this.eventEmitter.emit('payout.finality_confirmed', {
      transactionId,
      htsTransactionId,
      confirmations: mockConfirmations
    });
  }

  /**
   * Release liquidity reservation
   */
  private async releaseLiquidityReservation(reservationId: string, wasUtilized: boolean): Promise<void> {
    await this.liquidityReservationModel.findOneAndUpdate(
      { reservationId },
      {
        status: wasUtilized ? ReservationStatus.UTILIZED : ReservationStatus.RELEASED,
        releaseTimestamp: new Date(),
        utilizationTimestamp: wasUtilized ? new Date() : undefined
      }
    );

    this.eventEmitter.emit('liquidity.released', {
      reservationId,
      wasUtilized
    });
  }

  /**
   * Handle transaction failure
   */
  private async failTransaction(
    transactionId: any,
    failureReason: FailureReason,
    message: string
  ): Promise<void> {
    this.logger.error(`Transaction failed: ${failureReason} - ${message}`);

    await this.payoutTransactionModel.findByIdAndUpdate(transactionId, {
      status: TransactionStatus.FAILED,
      failureReason,
      failureMessage: message
    });

    this.eventEmitter.emit('payout.failed', {
      transactionId,
      failureReason,
      message
    });
  }

  /**
   * Get payout transaction status
   */
  async getPayoutStatus(transactionId: string): Promise<PayoutTransactionDocument | null> {
    return await this.payoutTransactionModel.findOne({ transactionId });
  }

  /**
   * Retry failed payout
   */
  async retryFailedPayout(transactionId: string): Promise<void> {
    const transaction = await this.payoutTransactionModel.findOne({ transactionId });
    
    if (!transaction || transaction.status !== TransactionStatus.FAILED) {
      throw new Error('Transaction not found or not in failed state');
    }

    if (transaction.retryMechanism && transaction.retryMechanism.currentRetry >= transaction.retryMechanism.maxRetries) {
      throw new Error('Maximum retry attempts exceeded');
    }

    // Increment retry count and retry
    await this.payoutTransactionModel.findOneAndUpdate(
      { transactionId },
      {
        status: TransactionStatus.INITIATED,
        'retryMechanism.currentRetry': (transaction.retryMechanism?.currentRetry || 0) + 1,
        'retryMechanism.nextRetryAt': new Date(Date.now() + (transaction.retryMechanism?.retryDelayMs || 30000))
      }
    );

    // Re-execute payout logic
    await this.requestPayout(
      transaction.policyId,
      transaction.payoutAmount,
      transaction.triggerId,
      transaction.beneficiaryAccountId,
      transaction.liquidityDetails.poolId
    );
  }

  // Helper methods
  private generateTransactionId(): string {
    return `TXN${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }

  private generateReservationId(): string {
    return `RSV${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }
}
