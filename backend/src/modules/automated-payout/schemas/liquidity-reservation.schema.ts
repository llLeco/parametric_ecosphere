import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LiquidityReservationDocument = LiquidityReservation & Document;

export enum ReservationStatus {
  ACTIVE = 'active',
  UTILIZED = 'utilized',
  RELEASED = 'released',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export enum ReservationType {
  PAYOUT_CLAIM = 'payout_claim',
  EMERGENCY_FUND = 'emergency_fund',
  REGULATORY_BUFFER = 'regulatory_buffer',
  REINSURANCE_COLLATERAL = 'reinsurance_collateral'
}

export interface PoolLiquiditySnapshot {
  totalLiquidity: number;
  availableLiquidity: number;
  reservedLiquidity: number;
  utilizationRate: number;
  liquidityTiers: {
    tier1: number; // Immediate liquidity
    tier2: number; // 1-7 days
    tier3: number; // 1-30 days
    tier4: number; // 30+ days
  };
}

export interface LiquiditySource {
  sourceId: string;
  sourceType: 'cash' | 'short_term_investment' | 'treasury_bills' | 'money_market';
  amount: number;
  liquidationTimeEstimate: number; // in hours
  liquidationCost: number; // percentage
}

@Schema({ timestamps: true })
export class LiquidityReservation {
  @Prop({ required: true, unique: true })
  reservationId: string;

  @Prop({ required: true })
  poolId: string;

  @Prop({ required: true })
  transactionId: string;

  @Prop({ required: true })
  policyId: string;

  @Prop({ required: true, enum: ReservationType })
  reservationType: ReservationType;

  @Prop({ required: true, enum: ReservationStatus, default: ReservationStatus.ACTIVE })
  status: ReservationStatus;

  @Prop({ required: true })
  reservedAmount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  reservationTimestamp: Date;

  @Prop({ required: true })
  expirationTimestamp: Date;

  @Prop()
  utilizationTimestamp?: Date;

  @Prop()
  releaseTimestamp?: Date;

  @Prop({ required: true, type: Object })
  poolSnapshot: PoolLiquiditySnapshot;

  @Prop({ type: [Object] })
  liquiditySources: LiquiditySource[];

  @Prop({ type: Object })
  liquidationPlan?: {
    immediatelyAvailable: number;
    requiresLiquidation: number;
    estimatedLiquidationTime: number; // hours
    liquidationCost: number;
    liquidationSteps: {
      step: number;
      sourceId: string;
      amount: number;
      estimatedTime: number;
    }[];
  };

  @Prop({ type: Object })
  riskAssessment?: {
    liquidityRisk: number;
    concentrationRisk: number;
    marketRisk: number;
    operationalRisk: number;
    overallRiskScore: number;
  };

  @Prop()
  priorityLevel?: number; // 1 = highest priority

  @Prop()
  requestedBy: string;

  @Prop()
  approvedBy?: string;

  @Prop()
  releasedBy?: string;

  @Prop({ type: Object })
  auditTrail?: {
    reservationRequested: Date;
    reservationApproved?: Date;
    utilizationStarted?: Date;
    utilizationCompleted?: Date;
    reservationReleased?: Date;
    events: {
      timestamp: Date;
      event: string;
      performer: string;
      details?: Record<string, any>;
    }[];
  };

  @Prop({ type: Object })
  performanceMetrics?: {
    reservationToUtilizationTime?: number; // minutes
    liquidationActualTime?: number; // hours
    liquidationActualCost?: number; // percentage
    varianceFromEstimate?: number; // percentage
  };

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const LiquidityReservationSchema = SchemaFactory.createForClass(LiquidityReservation);
