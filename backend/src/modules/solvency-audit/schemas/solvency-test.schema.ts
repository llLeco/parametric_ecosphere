import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SolvencyTestDocument = SolvencyTest & Document;

export enum SolvencyTestType {
  ROUTINE = 'routine',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
  STRESS_TEST = 'stress_test',
  SCENARIO_ANALYSIS = 'scenario_analysis',
  REGULATORY_MANDATED = 'regulatory_mandated',
  EVENT_TRIGGERED = 'event_triggered'
}

export enum SolvencyTestStatus {
  INITIATED = 'initiated',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  UNDER_REVIEW = 'under_review'
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  WARNING = 'warning',
  CRITICAL = 'critical'
}

export interface CapitalAdequacy {
  totalAssets: number;
  totalLiabilities: number;
  netAssets: number;
  minimumCapitalRequirement: number;
  solvencyCapitalRequirement: number;
  capitalBuffer: number;
  solvencyRatio: number;
  excessCapital: number;
  capitalDeficiency: number;
}

export interface RiskMetrics {
  underwritingRisk: number;
  marketRisk: number;
  creditRisk: number;
  operationalRisk: number;
  liquidityRisk: number;
  concentrationRisk: number;
  catastropheRisk: number;
  totalRisk: number;
}

export interface StressTestScenario {
  scenarioName: string;
  description: string;
  parameters: {
    lossMultiplier: number;
    marketShock: number;
    interestRateShock: number;
    creditDowngrade: number;
    liquidityStress: number;
  };
  results: {
    projectedLoss: number;
    remainingCapital: number;
    solvencyRatio: number;
    passedTest: boolean;
    capitalShortfall?: number;
  };
}

@Schema({ timestamps: true })
export class SolvencyTest {
  @Prop({ required: true, unique: true })
  testId: string;

  @Prop({ required: true, enum: SolvencyTestType })
  testType: SolvencyTestType;

  @Prop({ required: true, enum: SolvencyTestStatus, default: SolvencyTestStatus.INITIATED })
  status: SolvencyTestStatus;

  @Prop({ required: true })
  testDate: Date;

  @Prop()
  completionDate?: Date;

  @Prop({ required: true, type: Object })
  reportingPeriod: {
    startDate: Date;
    endDate: Date;
  };

  @Prop({ required: true, type: Object })
  capitalAdequacy: CapitalAdequacy;

  @Prop({ required: true, type: Object })
  riskMetrics: RiskMetrics;

  @Prop({ type: [Object] })
  stressTestScenarios?: StressTestScenario[];

  @Prop({ required: true, enum: ComplianceStatus })
  complianceStatus: ComplianceStatus;

  @Prop({ type: Object })
  regulatoryRequirements?: {
    jurisdiction: string;
    regulatorId: string;
    minimumSolvencyRatio: number;
    capitalBufferRequirement: number;
    testingFrequency: string;
    reportingDeadline: Date;
    lastSubmissionDate?: Date;
  };

  @Prop({ type: Object })
  portfolioAnalysis?: {
    totalPolicies: number;
    totalExposure: number;
    activeClaims: number;
    pendingPayouts: number;
    reservedFunds: number;
    diversificationBenefit: number;
    concentrationFactors: {
      geographic: number;
      peril: number;
      temporal: number;
    };
  };

  @Prop({ type: Object })
  liquidityAnalysis?: {
    immediateLiquidity: number;
    shortTermLiquidity: number;
    totalLiquidity: number;
    liquidityRatio: number;
    stressedLiquidity: number;
    liquidationTimeframe: number;
  };

  @Prop({ type: Object })
  reinsuranceImpact?: {
    totalReinsuranceRecoverable: number;
    netRetention: number;
    reinsuranceEffectiveness: number;
    concentrationRisk: number;
    counterpartyRisk: number;
  };

  @Prop({ type: [Object] })
  recommendations?: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    description: string;
    actionRequired: string;
    deadline?: Date;
    responsible: string;
  }[];

  @Prop({ type: Object })
  comparisonToPrevious?: {
    previousTestId: string;
    solvencyRatioChange: number;
    capitalChange: number;
    riskProfileChange: number;
    trendAnalysis: string;
  };

  @Prop({ type: Object })
  auditDetails?: {
    conductedBy: string;
    reviewedBy: string;
    approvedBy: string;
    methodologyUsed: string;
    dataSourcesUsed: string[];
    assumptionsUsed: string[];
    limitationsNoted: string[];
  };

  @Prop()
  hcsMessageId?: string;      // Immutable record on Hedera

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const SolvencyTestSchema = SchemaFactory.createForClass(SolvencyTest);
