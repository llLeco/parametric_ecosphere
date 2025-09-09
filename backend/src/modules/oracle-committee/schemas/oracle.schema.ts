import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OracleDocument = Oracle & Document;

export enum OracleStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DEACTIVATED = 'deactivated',
  PENDING_APPROVAL = 'pending_approval'
}

export enum OracleType {
  WEATHER_ORACLE = 'weather_oracle',
  SATELLITE_ORACLE = 'satellite_oracle',
  IOT_SENSOR_ORACLE = 'iot_sensor_oracle',
  GOVERNMENT_ORACLE = 'government_oracle',
  THIRD_PARTY_API = 'third_party_api',
  MANUAL_ORACLE = 'manual_oracle'
}

export interface ReputationMetrics {
  totalAttestations: number;
  accurateAttestations: number;
  accuracyRate: number;
  responseTime: number;      // average response time in minutes
  uptime: number;           // percentage uptime
  stakingAmount: number;    // economic stake for security
  slashingHistory: {
    date: Date;
    reason: string;
    amountSlashed: number;
  }[];
}

export interface GeographicCoverage {
  regions: string[];        // e.g., ['north_america', 'europe']
  coordinates: {
    latitude: number;
    longitude: number;
    radius: number;         // coverage radius in km
  }[];
  dataTypes: string[];      // e.g., ['temperature', 'rainfall', 'wind_speed']
}

@Schema({ timestamps: true })
export class Oracle {
  @Prop({ required: true, unique: true })
  oracleId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  operatorAccountId: string;

  @Prop({ required: true, enum: OracleType })
  oracleType: OracleType;

  @Prop({ required: true, enum: OracleStatus, default: OracleStatus.PENDING_APPROVAL })
  status: OracleStatus;

  @Prop({ required: true })
  publicKey: string;        // For signature verification

  @Prop({ required: true, type: Object })
  geographicCoverage: GeographicCoverage;

  @Prop({ required: true, type: Object })
  reputationMetrics: ReputationMetrics;

  @Prop({ required: true })
  registrationDate: Date;

  @Prop()
  lastActiveDate?: Date;

  @Prop({ type: Object })
  technicalSpecs?: {
    apiEndpoint?: string;
    updateFrequency: string;  // e.g., 'hourly', 'daily', 'real-time'
    dataAccuracy: number;     // claimed accuracy percentage
    certifications: string[]; // e.g., ['ISO 27001', 'SOC 2']
  };

  @Prop({ type: Object })
  economicTerms?: {
    feePerAttestation: number;
    currency: string;
    stakingRequirement: number;
    bondAmount: number;
  };

  @Prop({ type: [String] })
  supportedDataTypes: string[];

  @Prop({ type: Object })
  contactInfo?: {
    email: string;
    website?: string;
    supportContact?: string;
  };

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const OracleSchema = SchemaFactory.createForClass(Oracle);
