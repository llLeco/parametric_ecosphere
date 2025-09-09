import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * @type PolicyDocument
 * @description Mongoose document type for Policy schema
 * 
 * Combines the Policy class with Mongoose Document interface to provide
 * type safety and MongoDB-specific functionality.
 */
export type PolicyDocument = Policy & Document;

/**
 * @enum PolicyStatus
 * @description Enumeration of possible policy statuses
 * 
 * Defines the lifecycle states of a parametric insurance policy.
 */
export enum PolicyStatus {
  /** Policy is in draft state and not yet active */
  DRAFT = 'draft',
  /** Policy is active and eligible for trigger events */
  ACTIVE = 'active',
  /** Policy has been triggered and payout is being processed */
  TRIGGERED = 'triggered',
  /** Policy has been paid out successfully */
  PAID_OUT = 'paid_out',
  /** Policy has expired */
  EXPIRED = 'expired',
  /** Policy has been cancelled */
  CANCELLED = 'cancelled'
}

/**
 * @enum PolicyType
 * @description Enumeration of parametric insurance policy types
 * 
 * Defines the different types of parametric insurance policies supported
 * by the system, each corresponding to different risk parameters.
 */
export enum PolicyType {
  /** General weather-based insurance */
  WEATHER = 'weather',
  /** Earthquake insurance based on seismic activity */
  EARTHQUAKE = 'earthquake',
  /** Flood insurance based on water levels */
  FLOOD = 'flood',
  /** Drought insurance based on rainfall deficiency */
  DROUGHT = 'drought',
  /** Hurricane insurance based on wind speed and pressure */
  HURRICANE = 'hurricane',
  /** Crop yield insurance based on agricultural productivity */
  CROP_YIELD = 'crop_yield',
  /** Temperature-based insurance */
  TEMPERATURE = 'temperature',
  /** Rainfall-based insurance */
  RAINFALL = 'rainfall'
}

/**
 * @interface TriggerCondition
 * @description Defines the conditions that must be met to trigger a policy payout
 * 
 * Each policy can have multiple trigger conditions that define when payouts
 * should be triggered based on specific parameter values and locations.
 */
export interface TriggerCondition {
  /** Parameter name (e.g., 'temperature', 'rainfall', 'wind_speed') */
  parameter: string;
  /** Comparison operator for threshold evaluation */
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  /** Threshold value for comparison */
  threshold: number;
  /** Measurement period in days */
  measurementPeriod: number;
  /** Geographic location for the condition */
  location: {
    /** Latitude coordinate */
    latitude: number;
    /** Longitude coordinate */
    longitude: number;
    /** Radius in kilometers for location matching */
    radius: number;
  };
}

/**
 * @interface PremiumStructure
 * @description Defines the premium structure for a policy
 * 
 * Contains all information related to premium calculation and payment
 * schedules for the parametric insurance policy.
 */
export interface PremiumStructure {
  /** Base premium amount */
  basePremium: number;
  /** Currency code for the premium */
  currency: string;
  /** Payment schedule frequency */
  paymentSchedule: 'monthly' | 'quarterly' | 'annually' | 'single';
  /** Optional discount factors */
  discountFactors?: {
    /** Multi-year policy discount */
    multiYear?: number;
    /** Bundled policy discount */
    bundled?: number;
    /** Low risk area discount */
    lowRisk?: number;
  };
}

/**
 * @interface CoverageDetails
 * @description Defines the coverage details for a policy
 * 
 * Contains all information related to coverage limits, deductibles,
 * and payout structures for the parametric insurance policy.
 */
export interface CoverageDetails {
  /** Maximum payout amount */
  maxPayout: number;
  /** Deductible amount */
  deductible: number;
  /** Currency code for coverage */
  currency: string;
  /** Structure of payout calculation */
  payoutStructure: 'lump_sum' | 'proportional' | 'tiered';
  /** Waiting period in days before payout */
  waitingPeriod: number;
}

/**
 * @class Policy
 * @description Mongoose schema for parametric insurance policies
 * 
 * Represents a parametric insurance policy with all associated data including
 * coverage details, trigger conditions, premium structure, and risk management
 * information. This is the core entity in the parametric insurance system.
 * 
 * @example
 * ```typescript
 * const policy = new Policy({
 *   policyNumber: 'POL123456',
 *   beneficiaryAccountId: '0.0.123456',
 *   policyType: PolicyType.WEATHER,
 *   coverageDetails: { maxPayout: 10000, currency: 'USD' }
 * });
 * ```
 */
@Schema({ timestamps: true })
export class Policy {
  /** Unique policy number identifier */
  @Prop({ required: true })
  policyNumber: string;

  /** Hedera account ID of the policy beneficiary */
  @Prop({ required: true })
  beneficiaryAccountId: string;

  /** Hedera account ID of the insurer */
  @Prop({ required: true })
  insurerAccountId: string;

  /** Optional Hedera account ID of the broker */
  @Prop()
  brokerAccountId?: string;

  /** Type of parametric insurance policy */
  @Prop({ required: true, enum: PolicyType })
  policyType: PolicyType;

  /** Current status of the policy */
  @Prop({ required: true, enum: PolicyStatus, default: PolicyStatus.DRAFT })
  status: PolicyStatus;

  /** Array of trigger conditions that define when payouts occur */
  @Prop({ required: true, type: Object })
  triggerConditions: TriggerCondition[];

  /** Premium structure and payment details */
  @Prop({ required: true, type: Object })
  premiumStructure: PremiumStructure;

  /** Coverage details including limits and deductibles */
  @Prop({ required: true, type: Object })
  coverageDetails: CoverageDetails;

  /** Date when the policy becomes effective */
  @Prop({ required: true })
  effectiveDate: Date;

  /** Date when the policy expires */
  @Prop({ required: true })
  expirationDate: Date;

  /** Hedera Consensus Service topic ID for this policy */
  @Prop()
  hcsTopicId?: string;

  /** Hedera Token Service token ID for premium payments/payouts */
  @Prop()
  tokenId?: string;

  /** Risk assessment data for the policy */
  @Prop({ type: Object })
  riskAssessment?: {
    /** Numerical risk score */
    riskScore: number;
    /** Risk factors and their values */
    factors: Record<string, any>;
    /** Date of risk assessment */
    assessmentDate: Date;
    /** ID of the risk assessor */
    assessorId: string;
  };

  /** Risk pool allocation details */
  @Prop({ type: Object })
  riskPoolAllocation?: {
    /** ID of the risk pool */
    poolId: string;
    /** Percentage of risk allocated to this pool */
    allocationPercentage: number;
    /** Percentage of risk retained by insurer */
    retentionPercentage: number;
  };

  /** Reinsurance details for risk sharing */
  @Prop({ type: Object })
  reinsuranceDetails?: {
    /** ID of the reinsurer */
    reinsurerId: string;
    /** Percentage of risk ceded to reinsurer */
    cessionPercentage: number;
    /** Type of reinsurance treaty */
    treatyType: 'quota_share' | 'surplus' | 'excess_of_loss';
    /** Retention limit for the insurer */
    retentionLimit: number;
  };

  /** IPFS hashes of attached policy documents */
  @Prop({ type: [String] })
  attachedDocuments?: string[];

  /** Additional metadata for the policy */
  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const PolicySchema = SchemaFactory.createForClass(Policy);
