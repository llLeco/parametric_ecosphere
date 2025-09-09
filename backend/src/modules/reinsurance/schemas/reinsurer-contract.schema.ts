import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReinsurerContractDocument = ReinsurerContract & Document;

export enum ContractStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  PENDING_RENEWAL = 'pending_renewal'
}

export enum TreatyType {
  QUOTA_SHARE = 'quota_share',
  SURPLUS = 'surplus',
  EXCESS_OF_LOSS = 'excess_of_loss',
  STOP_LOSS = 'stop_loss',
  CATASTROPHE_EXCESS = 'catastrophe_excess'
}

export enum ReinsurerRating {
  AAA = 'AAA',
  AA_PLUS = 'AA+',
  AA = 'AA',
  AA_MINUS = 'AA-',
  A_PLUS = 'A+',
  A = 'A',
  A_MINUS = 'A-',
  BBB_PLUS = 'BBB+',
  BBB = 'BBB',
  BBB_MINUS = 'BBB-'
}

export interface TreatyTerms {
  cessionPercentage: number;
  retentionLimit: number;
  attachmentPoint?: number;    // For excess of loss
  limit?: number;              // Maximum coverage
  reinstatementProvisions?: {
    numberOfReinstatements: number;
    reinstatementPremium: number; // percentage
    reinstatementTerms: string;
  };
  commissionRate: number;      // Ceding commission
  profitSharing?: {
    profitThreshold: number;
    cedentShare: number;       // percentage
    reinsurerShare: number;    // percentage
  };
}

export interface FinancialTerms {
  currency: string;
  premiumPaymentTerms: string;
  claimPaymentTerms: string;
  securityArrangements: {
    letterOfCredit?: number;
    trustFund?: number;
    collateral?: number;
  };
  interestRate?: number;       // For funds withheld
  exchangeRateProtection?: boolean;
}

export interface PerformanceMetrics {
  totalPremiumCeded: number;
  totalClaimsRecovered: number;
  lossRatio: number;
  profitMargin: number;
  timeToPay: number;           // Average days to payment
  disputeRate: number;         // Percentage of disputed claims
  solvencyRatio: number;
  creditRating: ReinsurerRating;
  lastRatingUpdate: Date;
}

@Schema({ timestamps: true })
export class ReinsurerContract {
  @Prop({ required: true, unique: true })
  contractId: string;

  @Prop({ required: true })
  reinsurerId: string;

  @Prop({ required: true })
  reinsurerName: string;

  @Prop({ required: true })
  reinsurerAccountId: string;

  @Prop({ required: true })
  reinsurerWalletAddress: string;

  @Prop({ required: true, enum: TreatyType })
  treatyType: TreatyType;

  @Prop({ required: true, enum: ContractStatus, default: ContractStatus.ACTIVE })
  status: ContractStatus;

  @Prop({ required: true })
  effectiveDate: Date;

  @Prop({ required: true })
  expirationDate: Date;

  @Prop({ required: true, type: Object })
  treatyTerms: TreatyTerms;

  @Prop({ required: true, type: Object })
  financialTerms: FinancialTerms;

  @Prop({ type: Object })
  performanceMetrics?: PerformanceMetrics;

  @Prop({ type: [String] })
  coverageLines?: string[];    // e.g., ['weather', 'catastrophe']

  @Prop({ type: [String] })
  geographicScope?: string[];  // Covered regions

  @Prop({ type: Object })
  regulatoryCompliance?: {
    jurisdiction: string;
    licenseNumber: string;
    regulatoryApprovals: string[];
    complianceStatus: 'compliant' | 'non_compliant' | 'under_review';
    lastComplianceCheck: Date;
  };

  @Prop({ type: Object })
  riskLimits?: {
    maxSingleRisk: number;
    maxAggregateExposure: number;
    maxCatastropheExposure: number;
    concentrationLimits: {
      perEvent: number;
      perOccurrence: number;
      annual: number;
    };
  };

  @Prop({ type: Object })
  automaticRenewal?: {
    autoRenew: boolean;
    renewalNoticePeriod: number; // days
    renewalTerms: string;
    lastRenewalDate?: Date;
    nextRenewalDate?: Date;
  };

  @Prop({ type: Object })
  disputeResolution?: {
    mechanism: 'arbitration' | 'litigation' | 'mediation';
    jurisdiction: string;
    governingLaw: string;
    arbitrationRules?: string;
  };

  @Prop({ type: [Object] })
  amendmentHistory?: {
    amendmentDate: Date;
    amendmentType: string;
    description: string;
    amendedBy: string;
    effectiveDate: Date;
  }[];

  @Prop({ type: Object })
  contactInformation?: {
    primaryContact: {
      name: string;
      title: string;
      email: string;
      phone: string;
    };
    claimsContact: {
      name: string;
      email: string;
      phone: string;
      emergencyContact?: string;
    };
    accountingContact: {
      name: string;
      email: string;
      phone: string;
    };
  };

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const ReinsurerContractSchema = SchemaFactory.createForClass(ReinsurerContract);
