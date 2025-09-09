import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RiskPoolDocument = RiskPool & Document;

export enum PoolStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
  UNDER_REVIEW = 'under_review'
}

export enum PoolType {
  CATASTROPHE = 'catastrophe',
  WEATHER = 'weather',
  AGRICULTURAL = 'agricultural',
  MARINE = 'marine',
  AVIATION = 'aviation',
  MULTI_PERIL = 'multi_peril'
}

export interface RiskParameters {
  maxSingleLoss: number;
  maxAggregateExposure: number;
  concentrationLimits: {
    geographic: number;      // % of pool per geographic region
    sector: number;          // % of pool per industry sector
    peril: number;          // % of pool per peril type
  };
  minimumDiversification: number;
  expectedLossRatio: number;
  confidenceLevel: number;   // for VaR calculations
}

export interface PerformanceMetrics {
  inception: Date;
  totalPremiums: number;
  totalClaims: number;
  lossRatio: number;
  combinedRatio: number;
  returnOnCapital: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
}

export interface LiquidityManagement {
  targetLiquidityRatio: number;
  minimumLiquidityBuffer: number;
  liquidityStress: {
    oneDay: number;
    oneWeek: number;
    oneMonth: number;
  };
  emergencyFunding: {
    available: boolean;
    amount: number;
    source: string;
    cost: number;
  };
}

@Schema({ timestamps: true })
export class RiskPool {
  @Prop({ required: true, unique: true })
  poolId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: PoolType })
  poolType: PoolType;

  @Prop({ required: true, enum: PoolStatus, default: PoolStatus.ACTIVE })
  status: PoolStatus;

  @Prop({ required: true })
  managingEntityId: string;   // Account ID of pool manager

  @Prop({ required: true })
  targetCapacity: number;     // Target pool size

  @Prop({ required: true })
  currentCapacity: number;    // Current pool size

  @Prop({ required: true })
  minimumCapacity: number;    // Minimum operating capacity

  @Prop({ required: true })
  availableLiquidity: number; // Currently available for claims

  @Prop({ required: true })
  reservedLiquidity: number;  // Reserved for known claims

  @Prop({ required: true, type: Object })
  riskParameters: RiskParameters;

  @Prop({ required: true, type: Object })
  performanceMetrics: PerformanceMetrics;

  @Prop({ required: true, type: Object })
  liquidityManagement: LiquidityManagement;

  @Prop({ required: true })
  inceptionDate: Date;

  @Prop()
  maturityDate?: Date;        // For term pools

  @Prop({ type: [String] })
  allowedContributors?: string[]; // Account IDs allowed to contribute

  @Prop({ type: Object })
  feeStructure?: {
    managementFee: number;    // annual % of assets
    performanceFee: number;   // % of profits
    entryFee: number;        // % of contribution
    exitFee: number;         // % of withdrawal
  };

  @Prop({ type: Object })
  reinvestmentPolicy?: {
    automaticReinvestment: boolean;
    reinvestmentThreshold: number;
    allowedInvestments: string[];
    riskLimits: {
      creditRisk: number;
      marketRisk: number;
      concentrationRisk: number;
    };
  };

  @Prop({ type: Object })
  regulatoryCompliance?: {
    jurisdiction: string;
    license: string;
    regulatorId: string;
    solvencyRequirements: {
      minimumCapitalRatio: number;
      riskBasedCapital: number;
      stressTestRequirements: string[];
    };
    reportingRequirements: {
      frequency: string;
      nextReportDue: Date;
      lastReportSubmitted?: Date;
    };
  };

  @Prop({ type: [Object] })
  auditTrail?: {
    timestamp: Date;
    action: string;
    performedBy: string;
    details: Record<string, any>;
    ipfsHash?: string;
  }[];

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const RiskPoolSchema = SchemaFactory.createForClass(RiskPool);
