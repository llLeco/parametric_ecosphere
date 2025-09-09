import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * @type PayoutDocument
 * @description Mongoose document type for Payout schema
 * 
 * Combines the Payout class with Mongoose Document interface to provide
 * type safety and MongoDB-specific functionality.
 */
export type PayoutDocument = Payout & Document;

/**
 * @enum PayoutStatus
 * @description Enumeration of possible payout statuses
 * 
 * Defines the processing states of a payout in the system.
 */
export enum PayoutStatus {
  /** Payout amount has been calculated */
  CALCULATED = 'calculated',
  /** Payout has been approved for execution */
  APPROVED = 'approved',
  /** Payout is currently being processed */
  PROCESSING = 'processing',
  /** Payout has been completed successfully */
  COMPLETED = 'completed',
  /** Payout processing failed */
  FAILED = 'failed',
  /** Payout is under dispute */
  DISPUTED = 'disputed',
  /** Payout has been cancelled */
  CANCELLED = 'cancelled'
}

/**
 * @enum PayoutType
 * @description Enumeration of possible payout types
 * 
 * Defines the different types of payouts that can be processed
 * in the parametric insurance system.
 */
export enum PayoutType {
  /** Automatically processed payout */
  AUTOMATIC = 'automatic',
  /** Payout requiring manual review */
  MANUAL_REVIEW = 'manual_review',
  /** Payout for disputed claim */
  DISPUTED_CLAIM = 'disputed_claim',
  /** Partial payout amount */
  PARTIAL_PAYOUT = 'partial_payout'
}

/**
 * @interface PayoutCalculation
 * @description Payout calculation details
 * 
 * Contains the detailed calculation breakdown for a payout including
 * base amount, deductibles, adjustments, and final net payout.
 */
export interface PayoutCalculation {
  /** Base payout amount before adjustments */
  basePayout: number;
  /** Deductible amount to be subtracted */
  deductible: number;
  /** Array of adjustments applied to the payout */
  adjustments: {
    /** Type of adjustment */
    type: string;
    /** Adjustment amount */
    amount: number;
    /** Reason for the adjustment */
    reason: string;
  }[];
  /** Final net payout amount after all adjustments */
  netPayout: number;
  /** Currency code for the payout */
  currency: string;
}

/**
 * @interface RiskPoolDistribution
 * @description Risk pool distribution details
 * 
 * Defines how a payout is distributed across different risk pools
 * for risk sharing and liquidity management.
 */
export interface RiskPoolDistribution {
  /** ID of the risk pool */
  poolId: string;
  /** Contribution amount from this pool */
  contribution: number;
  /** Percentage of total payout from this pool */
  percentage: number;
}

/**
 * @interface ReinsuranceRecovery
 * @description Reinsurance recovery details
 * 
 * Contains information about reinsurance recovery for a payout,
 * including the reinsurer and recovery amounts.
 */
export interface ReinsuranceRecovery {
  /** ID of the reinsurer */
  reinsurerId: string;
  /** Amount recovered from reinsurer */
  recoveryAmount: number;
  /** Reference to the reinsurance treaty */
  treatyReference: string;
  /** Reference to the claim */
  claimReference: string;
}

/**
 * @class Payout
 * @description Mongoose schema for insurance payouts
 * 
 * Represents a payout record for parametric insurance claims including
 * calculation details, processing status, and execution information.
 * 
 * @example
 * ```typescript
 * const payout = new Payout({
 *   payoutId: 'PAY123456',
 *   policyId: 'POL123456',
 *   triggerId: 'TRG123456',
 *   beneficiaryAccountId: '0.0.123456',
 *   payoutType: PayoutType.AUTOMATIC
 * });
 * ```
 */
@Schema({ timestamps: true })
export class Payout {
  /** Unique identifier for the payout */
  @Prop({ required: true })
  payoutId: string;

  /** ID of the policy this payout is for */
  @Prop({ required: true })
  policyId: string;

  /** ID of the trigger that caused this payout */
  @Prop({ required: true })
  triggerId: string;

  /** Hedera account ID of the payout beneficiary */
  @Prop({ required: true })
  beneficiaryAccountId: string;

  /** Current processing status of the payout */
  @Prop({ required: true, enum: PayoutStatus, default: PayoutStatus.CALCULATED })
  status: PayoutStatus;

  /** Type of payout being processed */
  @Prop({ required: true, enum: PayoutType })
  payoutType: PayoutType;

  /** Detailed calculation breakdown for the payout */
  @Prop({ required: true, type: Object })
  calculation: PayoutCalculation;

  /** Timestamp when payout was calculated */
  @Prop({ required: true })
  calculationTimestamp: Date;

  /** Timestamp when payout was approved */
  @Prop()
  approvalTimestamp?: Date;

  /** Timestamp when payout was executed */
  @Prop()
  executionTimestamp?: Date;

  /** Hedera account ID of the approver */
  @Prop()
  approvedBy?: string;

  /** Hedera account ID of the executor */
  @Prop()
  executedBy?: string;

  /** Hedera Token Service transaction ID */
  @Prop()
  htsTransactionId?: string;

  /** Reference to Hedera Consensus Service payout message */
  @Prop()
  hcsMessageId?: string;

  /** Distribution across risk pools */
  @Prop({ type: [Object] })
  riskPoolDistributions?: RiskPoolDistribution[];

  /** Reinsurance recovery details */
  @Prop({ type: Object })
  reinsuranceRecovery?: ReinsuranceRecovery;

  /** Liquidity check results */
  @Prop({ type: Object })
  liquidityCheck?: {
    /** Available pool liquidity */
    poolLiquidity: number;
    /** Required amount for payout */
    requiredAmount: number;
    /** Whether sufficient liquidity exists */
    hasLiquidity: boolean;
    /** Timestamp of liquidity check */
    checkTimestamp: Date;
    /** Alternative liquidity source if needed */
    alternativeSource?: string;
  };

  /** Audit trail for compliance */
  @Prop({ type: Object })
  auditTrail?: {
    /** Whether calculation was validated */
    calculationValidated: boolean;
    /** Whether approval was validated */
    approvalValidated: boolean;
    /** Whether execution was validated */
    executionValidated: boolean;
    /** ID of the validator */
    validatedBy: string;
    /** Timestamp of validation */
    validationTimestamp: Date;
    /** Any irregularities found */
    irregularities?: string[];
  };

  /** IPFS hashes of supporting documents */
  @Prop({ type: [String] })
  supportingDocuments?: string[];

  /** Dispute information if applicable */
  @Prop({ type: Object })
  disputeInfo?: {
    /** Whether the payout is disputed */
    isDisputed: boolean;
    /** Timestamp of dispute */
    disputeTimestamp?: Date;
    /** ID of the disputing party */
    disputedBy?: string;
    /** Reason for dispute */
    reason?: string;
    /** Resolution of dispute */
    resolution?: string;
    /** ID of the resolver */
    resolvedBy?: string;
    /** Timestamp of resolution */
    resolutionTimestamp?: Date;
  };

  /** Additional metadata for the payout */
  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const PayoutSchema = SchemaFactory.createForClass(Payout);
