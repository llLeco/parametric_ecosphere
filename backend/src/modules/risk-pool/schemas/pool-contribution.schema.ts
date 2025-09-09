import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PoolContributionDocument = PoolContribution & Document;

export enum ContributionType {
  PREMIUM = 'premium',
  CAPITAL_INJECTION = 'capital_injection',
  INVESTMENT_RETURN = 'investment_return',
  REINSURANCE_RECOVERY = 'reinsurance_recovery',
  INTEREST_INCOME = 'interest_income',
  STOP_LOSS_RECOVERY = 'stop_loss_recovery'
}

export enum ContributionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ALLOCATED = 'allocated',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface AllocationBreakdown {
  liquidityReserve: number;    // Amount allocated to liquidity
  investmentFund: number;      // Amount allocated to investments
  operationalReserve: number;  // Amount for operational expenses
  regulatoryCapital: number;   // Amount for regulatory compliance
  contingencyReserve: number;  // Amount for contingencies
}

@Schema({ timestamps: true })
export class PoolContribution {
  @Prop({ required: true, unique: true })
  contributionId: string;

  @Prop({ required: true })
  poolId: string;

  @Prop({ required: true })
  contributorAccountId: string;

  @Prop({ required: true, enum: ContributionType })
  contributionType: ContributionType;

  @Prop({ required: true, enum: ContributionStatus, default: ContributionStatus.PENDING })
  status: ContributionStatus;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  contributionDate: Date;

  @Prop()
  effectiveDate?: Date;       // When contribution becomes active

  @Prop()
  policyId?: string;          // If from premium payment

  @Prop()
  htsTransactionId?: string;  // Hedera Token Service transaction

  @Prop()
  hcsMessageId?: string;      // Hedera Consensus Service reference

  @Prop({ type: Object })
  allocationBreakdown?: AllocationBreakdown;

  @Prop({ type: Object })
  feeCalculation?: {
    grossAmount: number;
    managementFee: number;
    entryFee: number;
    netContribution: number;
    feePercentage: number;
  };

  @Prop({ type: Object })
  riskAssessment?: {
    contributionRiskScore: number;
    impactOnPoolRisk: number;
    diversificationBenefit: number;
    concentrationIncrease: number;
  };

  @Prop({ type: Object })
  liquidityImpact?: {
    liquidityIncrease: number;
    newLiquidityRatio: number;
    availableForClaims: number;
    reserveRequirement: number;
  };

  @Prop()
  lockupPeriod?: number;      // Days before withdrawal allowed

  @Prop()
  expectedReturn?: number;    // Expected annual return %

  @Prop({ type: Object })
  performanceTracking?: {
    initialValue: number;
    currentValue: number;
    unrealizedGainLoss: number;
    realizedGainLoss: number;
    dividendsReceived: number;
  };

  @Prop()
  withdrawalEligibleDate?: Date;

  @Prop({ type: Object })
  complianceChecks?: {
    kycCompleted: boolean;
    amlCleared: boolean;
    regulatoryApproval: boolean;
    sanctionsCheck: boolean;
  };

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const PoolContributionSchema = SchemaFactory.createForClass(PoolContribution);
