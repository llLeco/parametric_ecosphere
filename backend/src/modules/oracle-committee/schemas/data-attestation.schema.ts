import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DataAttestationDocument = DataAttestation & Document;

export enum AttestationStatus {
  PENDING = 'pending',
  CONSENSUS_REACHED = 'consensus_reached',
  DISPUTED = 'disputed',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export interface OracleSignature {
  oracleId: string;
  signature: string;
  timestamp: Date;
  publicKey: string;
  weight: number;           // voting weight based on reputation
}

export interface ConsensusResult {
  requiredSignatures: number;
  receivedSignatures: number;
  consensusThreshold: number;  // percentage required for consensus
  consensusReached: boolean;
  finalValue: number;
  confidence: number;         // statistical confidence in result
  outliers: string[];        // oracle IDs that provided outlier data
}

@Schema({ timestamps: true })
export class DataAttestation {
  @Prop({ required: true, unique: true })
  attestationId: string;

  @Prop({ required: true })
  dataSourceId: string;

  @Prop({ required: true })
  requestTimestamp: Date;

  @Prop({ required: true })
  dataTimestamp: Date;       // When the actual data event occurred

  @Prop({ required: true, enum: AttestationStatus, default: AttestationStatus.PENDING })
  status: AttestationStatus;

  @Prop({ required: true, type: Object })
  dataRequest: {
    parameter: string;        // e.g., 'temperature', 'rainfall'
    location: {
      latitude: number;
      longitude: number;
      name?: string;
    };
    timeWindow: {
      start: Date;
      end: Date;
    };
    requiredAccuracy: number;
    urgency: 'low' | 'medium' | 'high';
  };

  @Prop({ type: [Object] })
  oracleSignatures: OracleSignature[];

  @Prop({ type: Object })
  consensusResult?: ConsensusResult;

  @Prop()
  hcsTopicId?: string;       // Hedera Consensus Service topic

  @Prop()
  hcsMessageId?: string;     // Reference to HCS message

  @Prop({ type: Object })
  aggregatedData?: {
    rawValues: number[];
    mean: number;
    median: number;
    standardDeviation: number;
    outlierThreshold: number;
    finalValue: number;
    unit: string;
  };

  @Prop({ type: Object })
  validationChecks?: {
    sourceValidation: boolean;
    rangeValidation: boolean;
    temporalValidation: boolean;
    crossValidation: boolean;
    anomalyDetection: boolean;
  };

  @Prop({ type: [Object] })
  disputeHistory?: {
    disputeId: string;
    disputedBy: string;
    reason: string;
    timestamp: Date;
    resolution?: string;
    resolvedBy?: string;
    resolutionTimestamp?: Date;
  }[];

  @Prop()
  expirationDate: Date;

  @Prop({ type: Object })
  qualityMetrics?: {
    dataFreshness: number;    // minutes since data collection
    sourceReliability: number;
    methodologyScore: number;
    completeness: number;     // percentage of required data points
  };

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const DataAttestationSchema = SchemaFactory.createForClass(DataAttestation);
