import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReinsuranceRecoveryDocument = ReinsuranceRecovery & Document;

export enum RecoveryStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  PAID = 'paid',
  DISPUTED = 'disputed',
  REJECTED = 'rejected',
  PARTIALLY_PAID = 'partially_paid'
}

export enum RecoveryType {
  CLAIM_RECOVERY = 'claim_recovery',
  CATASTROPHE_RECOVERY = 'catastrophe_recovery',
  AGGREGATE_RECOVERY = 'aggregate_recovery',
  REINSTATEMENT_RECOVERY = 'reinstatement_recovery'
}

export interface RecoveryCalculation {
  totalClaimAmount: number;
  applicableAmount: number;  // Amount subject to reinsurance
  deductibleAmount: number;
  recoveryAmount: number;
  reinsurerShare: number;    // Percentage
  netRecovery: number;       // After deductions
  currency: string;
}

export interface RecoveryDocumentation {
  claimDocuments: string[];   // IPFS hashes
  proofOfLoss: string;
  lossAdjusterReport: string;
  reinsurerNotification: string;
  supportingEvidence: string[];
}

@Schema({ timestamps: true })
export class ReinsuranceRecovery {
  @Prop({ required: true, unique: true })
  recoveryId: string;

  @Prop({ required: true })
  contractId: string;

  @Prop({ required: true })
  reinsurerId: string;

  @Prop({ required: true })
  claimId: string;

  @Prop({ required: true })
  policyId: string;

  @Prop({ required: true, enum: RecoveryType })
  recoveryType: RecoveryType;

  @Prop({ required: true, enum: RecoveryStatus, default: RecoveryStatus.PENDING })
  status: RecoveryStatus;

  @Prop({ required: true, type: Object })
  recoveryCalculation: RecoveryCalculation;

  @Prop({ type: Object })
  recoveryDocumentation?: RecoveryDocumentation;

  @Prop({ required: true })
  submissionDate: Date;

  @Prop()
  reinsurerResponseDate?: Date;

  @Prop()
  expectedPaymentDate?: Date;

  @Prop()
  actualPaymentDate?: Date;

  @Prop({ type: Object })
  paymentDetails?: {
    paymentAmount: number;
    paymentCurrency: string;
    paymentMethod: string;
    paymentReference: string;
    htsTransactionId?: string;
    paymentDate: Date;
  };

  @Prop({ type: Object })
  treatyApplicability?: {
    treatySection: string;
    applicableTerms: string[];
    limitUtilization: number;
    remainingLimit: number;
    reinstatementTriggered: boolean;
  };

  @Prop({ type: Object })
  lossDetails?: {
    eventDate: Date;
    eventType: string;
    eventLocation: string;
    eventDescription: string;
    initialLossEstimate: number;
    finalLossAmount: number;
    lossAdjustmentExpenses: number;
  };

  @Prop({ type: Object })
  disputeDetails?: {
    isDisputed: boolean;
    disputeAmount?: number;
    disputeReason?: string;
    disputeTimestamp?: Date;
    disputeResolutionMethod?: string;
    resolutionAmount?: number;
    resolutionDate?: Date;
  };

  @Prop({ type: [Object] })
  correspondenceLog?: {
    timestamp: Date;
    type: 'email' | 'letter' | 'call' | 'meeting';
    subject: string;
    summary: string;
    attachments?: string[];
    followUpRequired: boolean;
    followUpDate?: Date;
  }[];

  @Prop({ type: Object })
  recoveryTimeline?: {
    notificationDeadline: Date;
    documentationDeadline: Date;
    reviewPeriod: number;      // days
    paymentTerms: number;      // days after approval
    actualTimeline: {
          notificationSent: Date;
          documentsSubmitted: Date;
          reviewStarted?: Date;
          reviewCompleted?: Date;
          paymentProcessed?: Date;
        };
  };

  @Prop({ type: Object })
  performanceMetrics?: {
    submissionToApproval: number;  // days
    approvalToPayment: number;     // days
    totalProcessingTime: number;   // days
    reinsurerRating: number;       // 1-5 scale
    satisfactionScore: number;     // 1-10 scale
  };

  @Prop({ type: Object })
  regulatoryCompliance?: {
    reportingRequired: boolean;
    reportingJurisdiction: string[];
    complianceStatus: 'compliant' | 'pending' | 'non_compliant';
    reportingDeadlines: Date[];
    reportingCompleted: boolean[];
  };

  @Prop({ type: Object })
  auditTrail?: {
    createdBy: string;
    submittedBy: string;
    reviewedBy?: string;
    approvedBy?: string;
    processedBy?: string;
    events: {
      timestamp: Date;
      action: string;
      performer: string;
      result: string;
      notes?: string;
    }[];
  };

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const ReinsuranceRecoverySchema = SchemaFactory.createForClass(ReinsuranceRecovery);
