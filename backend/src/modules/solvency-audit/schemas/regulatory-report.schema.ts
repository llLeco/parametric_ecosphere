import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RegulatoryReportDocument = RegulatoryReport & Document;

export enum ReportType {
  SOLVENCY_REPORT = 'solvency_report',
  QUARTERLY_FINANCIAL = 'quarterly_financial',
  ANNUAL_STATEMENT = 'annual_statement',
  STRESS_TEST_REPORT = 'stress_test_report',
  INCIDENT_REPORT = 'incident_report',
  COMPLIANCE_CERTIFICATION = 'compliance_certification',
  RISK_ASSESSMENT = 'risk_assessment',
  AUDIT_FINDINGS = 'audit_findings',
  CONSUMER_PROTECTION = 'consumer_protection',
  ANTI_MONEY_LAUNDERING = 'anti_money_laundering'
}

export enum ReportStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  SUBMITTED = 'submitted',
  ACKNOWLEDGED = 'acknowledged',
  REJECTED = 'rejected',
  RESUBMISSION_REQUIRED = 'resubmission_required'
}

export interface RegulatoryBody {
  regulatorId: string;
  name: string;
  jurisdiction: string;
  contactPerson: string;
  submissionPortal: string;
  authenticationMethod: string;
}

export interface FinancialSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  premiumsWritten: number;
  claimsPaid: number;
  investmentIncome: number;
  operatingExpenses: number;
  netIncome: number;
  solvencyRatio: number;
  liquidityRatio: number;
}

export interface ComplianceMetrics {
  minimumCapitalCompliance: boolean;
  solvencyRequirementsCompliance: boolean;
  reserveAdequacy: boolean;
  governanceCompliance: boolean;
  reportingCompliance: boolean;
  consumerProtectionCompliance: boolean;
  overallComplianceScore: number;
}

@Schema({ timestamps: true })
export class RegulatoryReport {
  @Prop({ required: true, unique: true })
  reportId: string;

  @Prop({ required: true, enum: ReportType })
  reportType: ReportType;

  @Prop({ required: true, enum: ReportStatus, default: ReportStatus.DRAFT })
  status: ReportStatus;

  @Prop({ required: true, type: Object })
  reportingPeriod: {
    startDate: Date;
    endDate: Date;
    frequency: 'monthly' | 'quarterly' | 'annually' | 'ad_hoc';
  };

  @Prop({ required: true, type: Object })
  regulatoryBody: RegulatoryBody;

  @Prop({ required: true })
  submissionDeadline: Date;

  @Prop()
  submissionDate?: Date;

  @Prop()
  acknowledgmentDate?: Date;

  @Prop({ type: Object })
  financialSummary?: FinancialSummary;

  @Prop({ type: Object })
  complianceMetrics?: ComplianceMetrics;

  @Prop({ type: Object })
  solvencyAnalysis?: {
    currentSolvencyRatio: number;
    minimumRequiredRatio: number;
    excessCapital: number;
    capitalDeficiency?: number;
    stressTestResults: {
      scenarioName: string;
      passedTest: boolean;
      capitalImpact: number;
    }[];
    recommendations: string[];
  };

  @Prop({ type: Object })
  riskAssessment?: {
    totalRiskExposure: number;
    riskConcentrations: {
      geographic: Record<string, number>;
      peril: Record<string, number>;
      temporal: Record<string, number>;
    };
    riskMitigationMeasures: string[];
    residualRisk: number;
  };

  @Prop({ type: Object })
  operationalMetrics?: {
    claimsProcessingTime: number;
    customerSatisfactionScore: number;
    systemUptime: number;
    securityIncidents: number;
    dataBreaches: number;
    complaintResolutionTime: number;
  };

  @Prop({ type: [Object] })
  keyFindings?: {
    finding: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    impact: string;
    recommendation: string;
    timeline: string;
    responsible: string;
  }[];

  @Prop({ type: [Object] })
  correctiveActions?: {
    action: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    deadline: Date;
    responsible: string;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    progress: number; // percentage
  }[];

  @Prop({ type: [String] })
  attachments?: string[];      // IPFS hashes or file references

  @Prop({ type: Object })
  submissionDetails?: {
    submittedBy: string;
    submissionMethod: string;
    confirmationNumber: string;
    receipient: string;
    submissionFile: string;     // File reference
  };

  @Prop({ type: Object })
  reviewHistory?: {
    reviewedBy: string;
    reviewDate: Date;
    comments: string;
    decision: 'approve' | 'reject' | 'request_changes';
    changesRequested?: string[];
  }[];

  @Prop({ type: Object })
  blockchainEvidence?: {
    hcsTopicId: string;
    hcsMessageId: string;
    immutableHash: string;
    consensusTimestamp: Date;
    auditTrailReference: string;
  };

  @Prop({ type: Object })
  confidentialityHandling?: {
    classificationLevel: 'public' | 'internal' | 'confidential' | 'restricted';
    accessControl: string[];
    encryptionRequired: boolean;
    retentionPeriod: number;   // years
    disposalMethod: string;
  };

  @Prop({ type: Object })
  qualityAssurance?: {
    dataValidated: boolean;
    calculationsVerified: boolean;
    crossReferencesChecked: boolean;
    signedOff: boolean;
    qualityScore: number;      // 0-100
    validator: string;
    validationDate: Date;
  };

  @Prop({ type: Object })
  followUp?: {
    followUpRequired: boolean;
    followUpDate?: Date;
    followUpActions?: string[];
    responsibleParty?: string;
    escalationRequired?: boolean;
  };

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const RegulatoryReportSchema = SchemaFactory.createForClass(RegulatoryReport);
