import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * @type TriggerDocument
 * @description Mongoose document type for Trigger schema
 * 
 * Combines the Trigger class with Mongoose Document interface to provide
 * type safety and MongoDB-specific functionality.
 */
export type TriggerDocument = Trigger & Document;

/**
 * @enum TriggerStatus
 * @description Enumeration of possible trigger statuses
 * 
 * Defines the processing states of a trigger event in the system.
 */
export enum TriggerStatus {
  /** Trigger event is pending validation */
  PENDING = 'pending',
  /** Trigger event has been validated and conditions met */
  VALIDATED = 'validated',
  /** Trigger event has been rejected */
  REJECTED = 'rejected',
  /** Trigger event has been fully processed */
  PROCESSED = 'processed'
}

/**
 * @enum TriggerSource
 * @description Enumeration of possible trigger event sources
 * 
 * Defines the different sources that can submit trigger events
 * to the parametric insurance system.
 */
export enum TriggerSource {
  /** Oracle committee consensus */
  ORACLE_COMMITTEE = 'oracle_committee',
  /** External weather API */
  WEATHER_API = 'weather_api',
  /** Satellite data provider */
  SATELLITE_DATA = 'satellite_data',
  /** IoT sensor network */
  IOT_SENSOR = 'iot_sensor',
  /** Government agency data */
  GOVERNMENT_AGENCY = 'government_agency',
  /** Manual input by authorized users */
  MANUAL_INPUT = 'manual_input'
}

/**
 * @interface OracleAttestation
 * @description Oracle attestation data for trigger validation
 * 
 * Contains cryptographic attestation data from oracles that validate
 * trigger events, including signatures and reputation scores.
 */
export interface OracleAttestation {
  /** Unique identifier of the oracle */
  oracleId: string;
  /** Cryptographic signature of the attestation */
  signature: string;
  /** Timestamp of the attestation */
  timestamp: Date;
  /** Hash of the attested data */
  dataHash: string;
  /** Reputation score of the oracle */
  reputation: number;
}

/**
 * @interface TriggerValidation
 * @description Validation result for a trigger event
 * 
 * Contains the result of trigger event validation including
 * validation status, timestamp, and any rejection reasons.
 */
export interface TriggerValidation {
  /** ID of the validator that performed the validation */
  validatorId: string;
  /** Whether the trigger event is valid */
  isValid: boolean;
  /** Timestamp of the validation */
  validationTimestamp: Date;
  /** Hash of the validation result */
  validationHash: string;
  /** Optional reason for validation failure */
  reason?: string;
}

/**
 * @class Trigger
 * @description Mongoose schema for trigger events
 * 
 * Represents a trigger event that can activate parametric insurance payouts.
 * Contains event data, validation information, and processing results.
 * 
 * @example
 * ```typescript
 * const trigger = new Trigger({
 *   triggerId: 'TRG123456',
 *   policyId: 'POL123456',
 *   source: TriggerSource.ORACLE_COMMITTEE,
 *   eventData: { parameter: 'temperature', value: 35, unit: 'celsius' }
 * });
 * ```
 */
@Schema({ timestamps: true })
export class Trigger {
  /** Unique identifier for the trigger event */
  @Prop({ required: true })
  triggerId: string;

  /** ID of the policy this trigger is associated with */
  @Prop({ required: true })
  policyId: string;

  /** Source of the trigger event */
  @Prop({ required: true, enum: TriggerSource })
  source: TriggerSource;

  /** Current processing status of the trigger */
  @Prop({ required: true, enum: TriggerStatus, default: TriggerStatus.PENDING })
  status: TriggerStatus;

  /** Timestamp when the actual event occurred */
  @Prop({ required: true })
  eventTimestamp: Date;

  /** Timestamp when the trigger was reported to the system */
  @Prop({ required: true })
  reportedTimestamp: Date;

  /** Event data including parameter, value, and location */
  @Prop({ required: true, type: Object })
  eventData: {
    /** Parameter name (e.g., 'temperature', 'rainfall') */
    parameter: string;
    /** Measured value */
    value: number;
    /** Unit of measurement */
    unit: string;
    /** Geographic location of the event */
    location: {
      /** Latitude coordinate */
      latitude: number;
      /** Longitude coordinate */
      longitude: number;
      /** Optional location name */
      name?: string;
    };
    /** Optional measurement period */
    measurementPeriod?: {
      /** Start of measurement period */
      start: Date;
      /** End of measurement period */
      end: Date;
    };
  };

  /** Array of oracle attestations for this trigger */
  @Prop({ type: [Object] })
  oracleAttestations: OracleAttestation[];

  /** Array of validation results for this trigger */
  @Prop({ type: [Object] })
  validations: TriggerValidation[];

  /** Reference to Hedera Consensus Service message */
  @Prop()
  hcsMessageId?: string;

  /** Details of which trigger condition was met */
  @Prop({ type: Object })
  triggerConditionMet?: {
    /** Index of the condition that was met */
    conditionIndex: number;
    /** Threshold value for the condition */
    thresholdValue: number;
    /** Actual value that triggered the condition */
    actualValue: number;
    /** Operator used for comparison */
    operator: string;
    /** Whether the condition was met */
    isMet: boolean;
  };

  /** Results of trigger processing */
  @Prop({ type: Object })
  processingResults?: {
    /** Whether a payout was triggered */
    payoutTriggered: boolean;
    /** Amount of payout if triggered */
    payoutAmount?: number;
    /** Timestamp of processing */
    processingTimestamp: Date;
    /** ID of the processor */
    processorId: string;
    /** Any processing errors */
    errors?: string[];
  };

  /** IPFS hash of supporting evidence/data */
  @Prop()
  ipfsHash?: string;

  /** Additional metadata for the trigger */
  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const TriggerSchema = SchemaFactory.createForClass(Trigger);
