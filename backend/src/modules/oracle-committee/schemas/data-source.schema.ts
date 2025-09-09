import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DataSourceDocument = DataSource & Document;

export enum DataSourceType {
  WEATHER_API = 'weather_api',
  SATELLITE_FEED = 'satellite_feed',
  IOT_SENSOR_NETWORK = 'iot_sensor_network',
  GOVERNMENT_AGENCY = 'government_agency',
  FINANCIAL_MARKET_DATA = 'financial_market_data',
  AGRICULTURAL_SENSOR = 'agricultural_sensor',
  SEISMIC_MONITOR = 'seismic_monitor',
  HYDROLOGICAL_GAUGE = 'hydrological_gauge'
}

export enum DataSourceStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  DEGRADED = 'degraded',
  OFFLINE = 'offline',
  SUSPENDED = 'suspended'
}

export interface APIConfiguration {
  endpoint: string;
  authMethod: 'api_key' | 'oauth' | 'basic_auth' | 'none';
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  responseFormat: 'json' | 'xml' | 'csv';
  dataMapping: Record<string, string>; // Maps API fields to our standard fields
}

export interface QualityAssurance {
  lastQualityCheck: Date;
  qualityScore: number;     // 0-100 scale
  reliabilityMetrics: {
    uptime: number;         // percentage
    averageResponseTime: number; // milliseconds
    errorRate: number;      // percentage
    dataAccuracy: number;   // percentage
  };
  certifications: string[];
  maintenanceSchedule?: {
    frequency: string;
    lastMaintenance: Date;
    nextMaintenance: Date;
  };
}

@Schema({ timestamps: true })
export class DataSource {
  @Prop({ required: true, unique: true })
  dataSourceId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  provider: string;

  @Prop({ required: true, enum: DataSourceType })
  sourceType: DataSourceType;

  @Prop({ required: true, enum: DataSourceStatus, default: DataSourceStatus.ACTIVE })
  status: DataSourceStatus;

  @Prop({ required: true, type: Object })
  geographicCoverage: {
    global: boolean;
    regions: string[];
    coordinates?: {
      latitude: number;
      longitude: number;
      radius: number;
    }[];
    countries: string[];
  };

  @Prop({ required: true, type: [String] })
  dataTypes: string[];       // e.g., ['temperature', 'humidity', 'pressure']

  @Prop({ type: Object })
  apiConfiguration?: APIConfiguration;

  @Prop({ required: true, type: Object })
  qualityAssurance: QualityAssurance;

  @Prop({ required: true })
  updateFrequency: string;   // e.g., 'hourly', 'daily', 'real-time'

  @Prop({ required: true })
  dataRetention: number;     // days

  @Prop({ type: Object })
  costStructure?: {
    costPerRequest: number;
    currency: string;
    billingModel: 'per_request' | 'subscription' | 'free';
    monthlyQuota?: number;
  };

  @Prop({ type: Object })
  slaTerms?: {
    uptime: number;          // guaranteed uptime percentage
    responseTime: number;    // maximum response time in ms
    accuracy: number;        // guaranteed accuracy percentage
    penalties: {
      uptimeBreach: number;
      responseTimeBreach: number;
      accuracyBreach: number;
    };
  };

  @Prop({ type: [Object] })
  historicalPerformance?: {
    date: Date;
    uptime: number;
    averageResponseTime: number;
    errorCount: number;
    dataQualityScore: number;
  }[];

  @Prop({ type: Object })
  contactInfo: {
    technicalContact: string;
    supportEmail: string;
    emergencyContact?: string;
    documentation?: string;
  };

  @Prop({ type: Object })
  securityConfig?: {
    encryptionInTransit: boolean;
    encryptionAtRest: boolean;
    accessControls: string[];
    auditLogging: boolean;
    complianceStandards: string[];
  };

  @Prop()
  registrationDate: Date;

  @Prop()
  lastVerificationDate?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const DataSourceSchema = SchemaFactory.createForClass(DataSource);
