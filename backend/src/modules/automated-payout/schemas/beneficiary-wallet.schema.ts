import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BeneficiaryWalletDocument = BeneficiaryWallet & Document;

export enum WalletStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BLOCKED = 'blocked',
  PENDING_VERIFICATION = 'pending_verification'
}

export enum WalletType {
  HEDERA_NATIVE = 'hedera_native',
  METAMASK = 'metamask',
  WALLET_CONNECT = 'wallet_connect',
  HARDWARE_WALLET = 'hardware_wallet',
  CUSTODIAL = 'custodial'
}

export interface WalletValidation {
  isValidAddress: boolean;
  isActive: boolean;
  hasRequiredKeys: boolean;
  kycCompleted: boolean;
  amlCleared: boolean;
  sanctionsCheck: boolean;
  lastValidationDate: Date;
  validationScore: number; // 0-100
}

export interface TransactionHistory {
  transactionId: string;
  type: 'payout' | 'premium' | 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  timestamp: Date;
  status: 'completed' | 'failed' | 'pending';
  blockNumber?: number;
  consensusTimestamp?: Date;
}

export interface SecuritySettings {
  multiSigRequired: boolean;
  multiSigThreshold?: number;
  whitelistedAddresses?: string[];
  maxSingleTransactionLimit?: number;
  dailyTransactionLimit?: number;
  requiresApprovalAbove?: number;
  freezeSettings?: {
    isFrozen: boolean;
    freezeReason?: string;
    freezeTimestamp?: Date;
    unfreezeDate?: Date;
  };
}

@Schema({ timestamps: true })
export class BeneficiaryWallet {
  @Prop({ required: true, unique: true })
  walletId: string;

  @Prop({ required: true })
  beneficiaryAccountId: string;

  @Prop({ required: true })
  walletAddress: string;

  @Prop({ required: true, enum: WalletType })
  walletType: WalletType;

  @Prop({ required: true, enum: WalletStatus, default: WalletStatus.PENDING_VERIFICATION })
  status: WalletStatus;

  @Prop({ required: true, type: Object })
  validation: WalletValidation;

  @Prop({ type: Object })
  securitySettings?: SecuritySettings;

  @Prop({ type: [Object] })
  transactionHistory: TransactionHistory[];

  @Prop()
  registrationDate: Date;

  @Prop()
  lastVerificationDate?: Date;

  @Prop()
  lastTransactionDate?: Date;

  @Prop({ type: Object })
  balanceInfo?: {
    hbarBalance: number;
    tokenBalances: {
      tokenId: string;
      balance: number;
      symbol: string;
    }[];
    lastUpdated: Date;
  };

  @Prop({ type: Object })
  riskProfile?: {
    riskScore: number; // 0-100, higher = riskier
    riskFactors: string[];
    lastAssessment: Date;
    assessmentMethod: string;
  };

  @Prop({ type: Object })
  complianceChecks?: {
    kycLevel: 'basic' | 'enhanced' | 'premium';
    kycProvider: string;
    kycExpiryDate?: Date;
    amlStatus: 'clear' | 'flagged' | 'under_review';
    sanctionsStatus: 'clear' | 'flagged' | 'blocked';
    lastComplianceCheck: Date;
  };

  @Prop({ type: Object })
  walletMetadata?: {
    publicKey?: string;
    derivationPath?: string;
    walletProvider?: string;
    walletVersion?: string;
    supportedTokens?: string[];
  };

  @Prop({ type: Object })
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
    webhook?: string;
    transactionNotifications: boolean;
    securityAlerts: boolean;
  };

  @Prop({ type: [Object] })
  auditLog?: {
    timestamp: Date;
    action: string;
    performedBy: string;
    ipAddress?: string;
    userAgent?: string;
    result: 'success' | 'failure';
    details?: Record<string, any>;
  }[];

  @Prop({ type: Object })
  emergencyContacts?: {
    primaryContact: {
      name: string;
      email: string;
      phone?: string;
      relationship: string;
    };
    secondaryContact?: {
      name: string;
      email: string;
      phone?: string;
      relationship: string;
    };
  };

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const BeneficiaryWalletSchema = SchemaFactory.createForClass(BeneficiaryWallet);
