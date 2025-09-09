import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PayoutTransactionDocument = PayoutTransaction & Document;

export enum TransactionStatus {
  INITIATED = 'initiated',
  LIQUIDITY_RESERVED = 'liquidity_reserved',
  PENDING_EXECUTION = 'pending_execution',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed'
}

export enum FailureReason {
  INSUFFICIENT_LIQUIDITY = 'insufficient_liquidity',
  WALLET_VALIDATION_FAILED = 'wallet_validation_failed',
  HTS_TRANSACTION_FAILED = 'hts_transaction_failed',
  NETWORK_ERROR = 'network_error',
  POLICY_VALIDATION_FAILED = 'policy_validation_failed',
  BENEFICIARY_UNREACHABLE = 'beneficiary_unreachable',
  REGULATORY_HOLD = 'regulatory_hold',
  FINALITY_TIMEOUT = 'finality_timeout'
}

export interface HTSTransactionDetails {
  transactionId: string;
  tokenId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  consensusTimestamp: Date;
  transactionFee: number;
  memo?: string;
  finalityConfirmations: number;
  finalityThreshold: number; // Default 5000 (>5k as per diagram)
}

export interface LiquidityDetails {
  poolId: string;
  reservationId: string;
  reservedAmount: number;
  reservationTimestamp: Date;
  releaseTimestamp?: Date;
  utilizationRate: number;
}

export interface RetryMechanism {
  maxRetries: number;
  currentRetry: number;
  retryDelayMs: number;
  backoffMultiplier: number;
  nextRetryAt?: Date;
  lastRetryReason?: string;
}

@Schema({ timestamps: true })
export class PayoutTransaction {
  @Prop({ required: true, unique: true })
  transactionId: string;

  @Prop({ required: true })
  policyId: string;

  @Prop({ required: true })
  triggerId: string;

  @Prop({ required: true })
  payoutId: string;

  @Prop({ required: true })
  beneficiaryAccountId: string;

  @Prop({ required: true })
  beneficiaryWalletAddress: string;

  @Prop({ required: true })
  payoutAmount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true, enum: TransactionStatus, default: TransactionStatus.INITIATED })
  status: TransactionStatus;

  @Prop({ type: Object })
  htsDetails?: HTSTransactionDetails;

  @Prop({ required: true, type: Object })
  liquidityDetails: LiquidityDetails;

  @Prop({ type: Object })
  retryMechanism?: RetryMechanism;

  @Prop({ enum: FailureReason })
  failureReason?: FailureReason;

  @Prop()
  failureMessage?: string;

  @Prop({ required: true })
  initiatedTimestamp: Date;

  @Prop()
  completedTimestamp?: Date;

  @Prop()
  finalityConfirmedTimestamp?: Date;

  @Prop({ type: Object })
  validationChecks?: {
    policyValidation: boolean;
    beneficiaryValidation: boolean;
    liquidityValidation: boolean;
    regulatoryValidation: boolean;
    walletValidation: boolean;
  };

  @Prop({ type: Object })
  auditTrail?: {
    initiatedBy: string;
    approvedBy?: string;
    executedBy: string;
    steps: {
      timestamp: Date;
      action: string;
      performer: string;
      result: string;
      details?: Record<string, any>;
    }[];
  };

  @Prop({ type: Object })
  regulatoryCompliance?: {
    amlCheck: boolean;
    sanctionsCheck: boolean;
    kycValidation: boolean;
    reportingRequired: boolean;
    reportingSubmitted?: boolean;
  };

  @Prop({ type: Object })
  feeStructure?: {
    networkFee: number;
    processingFee: number;
    totalFees: number;
    netPayout: number;
  };

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const PayoutTransactionSchema = SchemaFactory.createForClass(PayoutTransaction);
