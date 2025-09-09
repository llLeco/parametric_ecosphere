import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ComplianceMonitoringDocument = ComplianceMonitoring & Document;

export enum MonitoringStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum ComplianceRule {
  MINIMUM_CAPITAL_RATIO = 'minimum_capital_ratio',
  LIQUIDITY_COVERAGE = 'liquidity_coverage',
  CONCENTRATION_LIMITS = 'concentration_limits',
  RESERVE_ADEQUACY = 'reserve_adequacy',
  GOVERNANCE_STANDARDS = 'governance_standards',
  REPORTING_TIMELINESS = 'reporting_timeliness',
  DATA_QUALITY = 'data_quality',
  CUSTOMER_PROTECTION = 'customer_protection',
  ANTI_MONEY_LAUNDERING = 'anti_money_laundering',
  PRIVACY_PROTECTION = 'privacy_protection'
}

export enum ViolationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface MonitoringRule {
  ruleId: string;
  ruleName: string;
  description: string;
  complianceRule: ComplianceRule;
  threshold: {
    operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'between';
    value: number;
    secondValue?: number;     // For 'between' operator
    unit?: string;
  };
  frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
}

export interface ComplianceViolation {
  violationId: string;
  ruleId: string;
  ruleName: string;
  detectedAt: Date;
  severity: ViolationSeverity;
  currentValue: number;
  expectedValue: number;
  deviation: number;
  description: string;
  impactAssessment: string;
  recommendedActions: string[];
  escalationRequired: boolean;
  resolvedAt?: Date;
  resolutionActions?: string[];
}

export interface RemediationPlan {
  planId: string;
  violationIds: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedResolutionTime: number; // hours
  requiredResources: string[];
  responsibleTeam: string;
  approvedBy?: string;
  implementationSteps: {
    step: number;
    description: string;
    estimatedDuration: number; // hours
    dependencies?: string[];
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
    completedAt?: Date;
  }[];
}

@Schema({ timestamps: true })
export class ComplianceMonitoring {
  @Prop({ required: true, unique: true })
  monitoringId: string;

  @Prop({ required: true })
  monitoringDate: Date;

  @Prop({ required: true, enum: MonitoringStatus, default: MonitoringStatus.ACTIVE })
  status: MonitoringStatus;

  @Prop({ required: true, type: [Object] })
  monitoringRules: MonitoringRule[];

  @Prop({ type: [Object] })
  violations?: ComplianceViolation[];

  @Prop({ type: [Object] })
  remediationPlans?: RemediationPlan[];

  @Prop({ type: Object })
  overallComplianceScore?: {
    score: number;            // 0-100
    previousScore?: number;
    trend: 'improving' | 'stable' | 'declining';
    lastCalculated: Date;
    breakdown: {
      capitalAdequacy: number;
      liquidity: number;
      riskManagement: number;
      governance: number;
      reporting: number;
      customerProtection: number;
    };
  };

  @Prop({ type: Object })
  regulatoryAlignment?: {
    jurisdiction: string;
    regulatorId: string;
    lastReviewDate: Date;
    nextReviewDate: Date;
    alignmentScore: number;
    gaps: {
      gapDescription: string;
      priority: string;
      targetResolutionDate: Date;
    }[];
  };

  @Prop({ type: Object })
  automatedMonitoring?: {
    enabled: boolean;
    lastRunTime: Date;
    nextRunTime: Date;
    rulesEvaluated: number;
    violationsDetected: number;
    alertsSent: number;
    systemPerformance: {
      averageResponseTime: number; // milliseconds
      successRate: number;
      errorRate: number;
    };
  };

  @Prop({ type: Object })
  escalationMatrix?: {
    level1: {
      triggerConditions: string[];
      notificationList: string[];
      responseTimeRequired: number; // hours
    };
    level2: {
      triggerConditions: string[];
      notificationList: string[];
      responseTimeRequired: number; // hours
    };
    level3: {
      triggerConditions: string[];
      notificationList: string[];
      responseTimeRequired: number; // hours
    };
  };

  @Prop({ type: Object })
  communicationLog?: {
    stakeholderNotifications: {
      timestamp: Date;
      recipient: string;
      channel: 'email' | 'sms' | 'dashboard' | 'api';
      subject: string;
      urgency: 'low' | 'medium' | 'high' | 'critical';
      acknowledged: boolean;
      acknowledgedAt?: Date;
    }[];
    regulatorCommunications: {
      timestamp: Date;
      regulatorId: string;
      communicationType: 'notification' | 'report' | 'inquiry_response';
      subject: string;
      referenceNumber?: string;
      responseRequired: boolean;
      responseDeadline?: Date;
      responseProvided?: boolean;
    }[];
  };

  @Prop({ type: Object })
  performanceMetrics?: {
    meanTimeToDetection: number;  // hours
    meanTimeToResolution: number; // hours
    falsePositiveRate: number;
    complianceUptime: number;     // percentage
    systemReliability: number;    // percentage
  };

  @Prop({ type: Object })
  historicalTrends?: {
    complianceScoreHistory: {
      date: Date;
      score: number;
    }[];
    violationTrends: {
      month: string;
      totalViolations: number;
      criticalViolations: number;
      averageResolutionTime: number;
    }[];
  };

  @Prop({ type: Object })
  auditReadiness?: {
    documentationComplete: boolean;
    evidenceCollected: boolean;
    processesDocumented: boolean;
    staffTrained: boolean;
    systemsTestedRecently: boolean;
    readinessScore: number;      // 0-100
    lastAssessmentDate: Date;
    nextAssessmentDue: Date;
  };

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const ComplianceMonitoringSchema = SchemaFactory.createForClass(ComplianceMonitoring);
