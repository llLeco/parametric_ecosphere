import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CessionTransactionDocument = CessionTransaction & Document;

export enum CessionStatus {
  INITIATED = 'initiated',
  CALCULATED = 'calculated',
  APPROVED = 'approved',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DISPUTED = 'disputed',
  REVERSED = 'reversed'
}

export enum CessionType {
  PREMIUM_CESSION = 'premium_cession',
  CLAIM_RECOVERY = 'claim_recovery',
  PROFIT_SHARING = 'profit_sharing',
  COMMISSION_PAYMENT = 'commission_payment',
  COLLATERAL_ADJUSTMENT = 'collateral_adjustment'
}

export interface CessionCalculation {
  grossAmount: number;
  cessionPercentage: number;
  netCessionAmount: number;
  retainedAmount: number;
  commissionAmount: number;
  profitSharingAmount?: number;
  netPayableAmount: number;
  currency: string;
}

export interface HTSCessionDetails {
  transactionId: string;
  fromAccount: string;
  toAccount: string;
  tokenId: string;
  amount: number;
  consensusTimestamp: Date;
  transactionFee: number;
  memo: string;
  finalityConfirmations: number;
}

export interface ValidationChecks {
  contractValidation: boolean;
  amountValidation: boolean;
  limitValidation: boolean;
  walletValidation: boolean;
  regulatoryValidation: boolean;
  fraudDetection: boolean;
}

@Schema({ timestamps: true })
export class CessionTransaction {
  @Prop({ required: true, unique: true })
  cessionId: string;

  @Prop({ required: true })
  contractId: string;

  @Prop({ required: true })
  reinsurerId: string;

  @Prop({ required: true })
  policyId?: string;        // For claim-related cessions

  @Prop({ required: true })
  payoutId?: string;        // For claim recoveries

  @Prop({ required: true, enum: CessionType })
  cessionType: CessionType;

  @Prop({ required: true, enum: CessionStatus, default: CessionStatus.INITIATED })
  status: CessionStatus;

  @Prop({ required: true, type: Object })
  cessionCalculation: CessionCalculation;

  @Prop({ type: Object })
  htsDetails?: HTSCessionDetails;

  @Prop({ required: true, type: Object })
  validationChecks: ValidationChecks;

  @Prop({ required: true })
  initiatedTimestamp: Date;

  @Prop()
  calculatedTimestamp?: Date;

  @Prop()
  approvedTimestamp?: Date;

  @Prop()
  executedTimestamp?: Date;

  @Prop()
  completedTimestamp?: Date;

  @Prop()
  initiatedBy: string;

  @Prop()
  approvedBy?: string;

  @Prop()
  executedBy?: string;

  @Prop({ type: Object })
  riskData?: {
    originalExposure: number;
    cededExposure: number;
    retainedExposure: number;
    riskCategory: string;
    perilType: string;
    geographicLocation: string;
  };

  @Prop({ type: Object })
  automaticTriggers?: {
    triggeredByPolicy: boolean;
    triggeredByClaim: boolean;
    triggeredByThreshold: boolean;
    triggerCondition: string;
    triggerTimestamp: Date;
  };

  @Prop({ type: Object })
  performanceImpact?: {
    treatyUtilization: number;
    remainingCapacity: number;
    impactOnLossRatio: number;
    impactOnProfitability: number;
  };

  @Prop({ type: Object })
  regulatoryReporting?: {
    reportingRequired: boolean;
    reportingJurisdiction: string;
    reportingDeadline?: Date;
    reportingCompleted?: boolean;
    reportingReference?: string;
  };

  @Prop({ type: Object })
  disputeInformation?: {
    isDisputed: boolean;
    disputeReason?: string;
    disputeAmount?: number;
    disputeTimestamp?: Date;
    disputeResolution?: string;
    resolutionTimestamp?: Date;
  };

  @Prop({ type: Object })
  auditTrail?: {
    events: {
      timestamp: Date;
      action: string;
      performer: string;
      details: Record<string, any>;
      result: 'success' | 'failure' | 'pending';
    }[];
  };

  @Prop({ type: Object })
  retryMechanism?: {
    maxRetries: number;
    currentRetry: number;
    retryDelayMs: number;
    lastRetryTimestamp?: Date;
    retryReason?: string;
  };

  @Prop()
  failureReason?: string;

  @Prop()
  failureMessage?: string;

  @Prop({ type: Object })
  reconciliation?: {
    reconciledAmount: number;
    reconciledTimestamp?: Date;
    reconciliationReference: string;
    discrepancies?: {
      expectedAmount: number;
      actualAmount: number;
      difference: number;
      reason: string;
    }[];
  };

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const CessionTransactionSchema = SchemaFactory.createForClass(CessionTransaction);
