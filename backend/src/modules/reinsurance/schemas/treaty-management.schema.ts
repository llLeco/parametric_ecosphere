import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TreatyManagementDocument = TreatyManagement & Document;

export enum TreatyStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated'
}

export interface TreatyPerformance {
  periodStart: Date;
  periodEnd: Date;
  premiumsWritten: number;
  premiumsCeded: number;
  claimsIncurred: number;
  claimsRecovered: number;
  lossRatio: number;
  cededLossRatio: number;
  profitSharing: number;
  commission: number;
  netResult: number;
}

export interface CapacityUtilization {
  totalCapacity: number;
  utilizedCapacity: number;
  availableCapacity: number;
  utilizationPercentage: number;
  peakUtilization: number;
  peakUtilizationDate: Date;
}

@Schema({ timestamps: true })
export class TreatyManagement {
  @Prop({ required: true, unique: true })
  treatyId: string;

  @Prop({ required: true })
  treatyName: string;

  @Prop({ required: true })
  contractId: string;

  @Prop({ required: true })
  reinsurerId: string;

  @Prop({ required: true, enum: TreatyStatus })
  status: TreatyStatus;

  @Prop({ required: true })
  treatyYear: number;

  @Prop({ required: true })
  inceptionDate: Date;

  @Prop({ required: true })
  expirationDate: Date;

  @Prop({ type: Object })
  currentPerformance?: TreatyPerformance;

  @Prop({ type: [Object] })
  historicalPerformance?: TreatyPerformance[];

  @Prop({ required: true, type: Object })
  capacityUtilization: CapacityUtilization;

  @Prop({ type: Object })
  riskAccumulation?: {
    totalRiskExposure: number;
    concentrationByRegion: Record<string, number>;
    concentrationByPeril: Record<string, number>;
    concentrationByPolicy: Record<string, number>;
    diversificationScore: number;
  };

  @Prop({ type: Object })
  profitabilityAnalysis?: {
    totalPremiumIncome: number;
    totalClaimsCost: number;
    totalCommissions: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    returnOnCapital: number;
  };

  @Prop({ type: Object })
  renewalInformation?: {
    renewalDate: Date;
    renewalTerms: string;
    rateChange: number;        // percentage
    capacityChange: number;    // percentage
    termChanges: string[];
    renewalProbability: number; // 0-1
    competitorOffers?: {
      competitor: string;
      offeredRate: number;
      offeredCapacity: number;
      terms: string;
    }[];
  };

  @Prop({ type: Object })
  riskManagementMetrics?: {
    var95: number;             // 95% Value at Risk
    var99: number;             // 99% Value at Risk
    expectedShortfall: number;
    stressTestResults: {
      scenario: string;
      projectedLoss: number;
      surplusAfterLoss: number;
      survivalProbability: number;
    }[];
  };

  @Prop({ type: [Object] })
  amendments?: {
    amendmentDate: Date;
    amendmentType: string;
    description: string;
    effectiveDate: Date;
    impact: string;
    approvedBy: string[];
  }[];

  @Prop({ type: Object })
  complianceStatus?: {
    regulatoryCompliance: boolean;
    auditStatus: 'passed' | 'failed' | 'pending';
    lastAuditDate: Date;
    nextAuditDate: Date;
    complianceNotes: string[];
  };

  @Prop({ type: Object })
  marketConditions?: {
    industryLossRatio: number;
    marketCapacity: number;
    competitivePricing: number;
    economicIndicators: {
      gdpGrowth: number;
      inflationRate: number;
      interestRates: number;
    };
    catastropheBudget: number;
    marketSentiment: 'bullish' | 'bearish' | 'neutral';
  };

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const TreatyManagementSchema = SchemaFactory.createForClass(TreatyManagement);
