import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditTrailDocument = AuditTrail & Document;

export enum AuditEventType {
  POLICY_CREATED = 'policy_created',
  POLICY_ACTIVATED = 'policy_activated',
  TRIGGER_RECEIVED = 'trigger_received',
  TRIGGER_VALIDATED = 'trigger_validated',
  PAYOUT_CALCULATED = 'payout_calculated',
  PAYOUT_EXECUTED = 'payout_executed',
  LIQUIDITY_RESERVED = 'liquidity_reserved',
  LIQUIDITY_RELEASED = 'liquidity_released',
  CESSION_PROCESSED = 'cession_processed',
  RECOVERY_SUBMITTED = 'recovery_submitted',
  SOLVENCY_TEST_CONDUCTED = 'solvency_test_conducted',
  COMPLIANCE_CHECK = 'compliance_check',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  CONFIGURATION_CHANGE = 'configuration_change',
  SYSTEM_ERROR = 'system_error',
  SECURITY_ALERT = 'security_alert',
  REGULATORY_REPORT = 'regulatory_report'
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum AuditCategory {
  POLICY_MANAGEMENT = 'policy_management',
  CLAIMS_PROCESSING = 'claims_processing',
  FINANCIAL_TRANSACTION = 'financial_transaction',
  RISK_MANAGEMENT = 'risk_management',
  COMPLIANCE = 'compliance',
  SECURITY = 'security',
  SYSTEM_OPERATION = 'system_operation',
  USER_ACTIVITY = 'user_activity',
  DATA_INTEGRITY = 'data_integrity'
}

export interface AuditContext {
  userId?: string;
  userRole?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  traceId?: string;
}

export interface AuditData {
  entityType?: string;
  entityId?: string;
  operation?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  parameters?: Record<string, any>;
  result?: any;
  errorDetails?: {
    errorCode: string;
    errorMessage: string;
    stackTrace?: string;
  };
}

export interface BlockchainRecord {
  hcsTopicId: string;
  hcsMessageId: string;
  consensusTimestamp: Date;
  transactionId?: string;
  messageHash: string;
}

@Schema({ timestamps: true })
export class AuditTrail {
  @Prop({ required: true, unique: true })
  auditId: string;

  @Prop({ required: true, enum: AuditEventType })
  eventType: AuditEventType;

  @Prop({ required: true, enum: AuditSeverity, default: AuditSeverity.INFO })
  severity: AuditSeverity;

  @Prop({ required: true, enum: AuditCategory })
  category: AuditCategory;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Object })
  context?: AuditContext;

  @Prop({ type: Object })
  auditData?: AuditData;

  @Prop({ type: Object })
  blockchainRecord?: BlockchainRecord;

  @Prop({ type: Object })
  complianceFlags?: {
    gdprRelevant: boolean;
    pciRelevant: boolean;
    soxRelevant: boolean;
    regulatoryRelevant: boolean;
    retentionPeriod: number; // days
    encryptionRequired: boolean;
  };

  @Prop({ type: Object })
  performanceMetrics?: {
    processingTime: number; // milliseconds
    memoryUsage: number;
    cpuUsage: number;
    networkLatency?: number;
  };

  @Prop({ type: [String] })
  tags?: string[];

  @Prop()
  correlationId?: string;     // Links related audit events

  @Prop()
  parentAuditId?: string;     // Hierarchical relationship

  @Prop({ type: [String] })
  affectedEntities?: string[]; // List of affected entity IDs

  @Prop({ type: Object })
  riskImpact?: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    impactDescription: string;
    mitigationActions?: string[];
  };

  @Prop({ type: Object })
  regulatoryImplications?: {
    jurisdictions: string[];
    reportingRequired: boolean;
    reportingDeadline?: Date;
    complianceStatus: 'compliant' | 'non_compliant' | 'under_review';
  };

  @Prop({ type: Object })
  dataClassification?: {
    confidentiality: 'public' | 'internal' | 'confidential' | 'restricted';
    integrity: 'low' | 'medium' | 'high' | 'critical';
    availability: 'low' | 'medium' | 'high' | 'critical';
    personalData: boolean;
    financialData: boolean;
  };

  @Prop()
  retentionExpiryDate?: Date;

  @Prop({ type: Object })
  verification?: {
    checksumVerified: boolean;
    signatureVerified: boolean;
    timestampVerified: boolean;
    blockchainVerified: boolean;
    lastVerificationDate: Date;
  };

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const AuditTrailSchema = SchemaFactory.createForClass(AuditTrail);
