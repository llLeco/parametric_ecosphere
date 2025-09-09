import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LiquidityPositionDocument = LiquidityPosition & Document;

export enum PositionType {
  CASH = 'cash',
  SHORT_TERM_INVESTMENT = 'short_term_investment',
  TREASURY_BILLS = 'treasury_bills',
  MONEY_MARKET = 'money_market',
  COMMITTED_CAPITAL = 'committed_capital',
  CONTINGENT_CAPITAL = 'contingent_capital'
}

export enum LiquidityTier {
  TIER_1 = 'tier_1',         // Immediately available (cash)
  TIER_2 = 'tier_2',         // 1-7 days to liquidate
  TIER_3 = 'tier_3',         // 1-30 days to liquidate
  TIER_4 = 'tier_4'          // 30+ days to liquidate
}

export interface StressTestResults {
  scenarioName: string;
  liquidityShortfall: number;
  timeToLiquidation: number;  // days
  liquidationCost: number;    // as % of position value
  survivabilityDays: number;
}

@Schema({ timestamps: true })
export class LiquidityPosition {
  @Prop({ required: true, unique: true })
  positionId: string;

  @Prop({ required: true })
  poolId: string;

  @Prop({ required: true, enum: PositionType })
  positionType: PositionType;

  @Prop({ required: true, enum: LiquidityTier })
  liquidityTier: LiquidityTier;

  @Prop({ required: true })
  currentValue: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  lastValuationDate: Date;

  @Prop({ required: true })
  availableAmount: number;    // Amount available for immediate use

  @Prop({ required: true })
  encumberedAmount: number;   // Amount committed/reserved

  @Prop()
  maturityDate?: Date;        // For term investments

  @Prop()
  yieldRate?: number;         // Current yield/interest rate

  @Prop({ type: Object })
  liquidationTerms?: {
    noticePeriod: number;     // days required for liquidation notice
    penaltyRate: number;      // penalty for early liquidation
    minimumHolding: number;   // minimum amount that must be retained
    liquidationFee: number;   // fixed fee for liquidation
  };

  @Prop({ type: Object })
  riskMetrics?: {
    creditRisk: number;       // counterparty credit risk
    marketRisk: number;       // market value risk
    liquidityRisk: number;    // liquidity/funding risk
    operationalRisk: number;  // operational risk
    var95: number;           // 95% Value at Risk
    expectedShortfall: number; // Expected shortfall beyond VaR
  };

  @Prop({ type: [Object] })
  stressTestResults?: StressTestResults[];

  @Prop({ type: Object })
  counterpartyInfo?: {
    name: string;
    rating: string;
    jurisdiction: string;
    relationshipType: string;
    exposureLimit: number;
    currentExposure: number;
  };

  @Prop({ type: Object })
  performanceHistory?: {
    initialValue: number;
    highWaterMark: number;
    totalReturn: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };

  @Prop({ type: Object })
  regulatoryTreatment?: {
    baseLiquidityRatio: boolean;
    netStableFunding: boolean;
    leverageRatio: boolean;
    liquidityCoverageRatio: boolean;
    riskWeight: number;
  };

  @Prop({ type: Object })
  cashFlowProjection?: {
    next7Days: number;
    next30Days: number;
    next90Days: number;
    next365Days: number;
  };

  @Prop({ type: [Object] })
  transactionHistory?: {
    timestamp: Date;
    transactionType: 'deposit' | 'withdrawal' | 'interest' | 'revaluation';
    amount: number;
    balanceAfter: number;
    reference: string;
  }[];

  @Prop()
  internalRating?: string;    // Internal risk rating

  @Prop()
  reviewDate?: Date;          // Next review date

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const LiquidityPositionSchema = SchemaFactory.createForClass(LiquidityPosition);
