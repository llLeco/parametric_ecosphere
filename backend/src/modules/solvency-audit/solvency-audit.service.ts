import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SolvencyTest, SolvencyTestDocument, SolvencyTestType, ComplianceStatus } from './schemas/solvency-test.schema';
import { AuditTrail, AuditTrailDocument, AuditEventType, AuditSeverity, AuditCategory } from './schemas/audit-trail.schema';

@Injectable()
export class SolvencyAuditService {
  private readonly logger = new Logger(SolvencyAuditService.name);

  constructor(
    @InjectModel(SolvencyTest.name) private solvencyTestModel: Model<SolvencyTestDocument>,
    @InjectModel(AuditTrail.name) private auditTrailModel: Model<AuditTrailDocument>,
    private eventEmitter: EventEmitter2
  ) {
    // Set up event listeners for audit trail
    this.setupAuditListeners();
  }

  /**
   * Conduct real-time solvency test as shown in diagram
   */
  async conductSolvencyTest(
    testType: SolvencyTestType = SolvencyTestType.ROUTINE
  ): Promise<SolvencyTestDocument> {
    this.logger.log(`Conducting solvency test: ${testType}`);

    // Create audit trail entry
    await this.createAuditEntry(
      AuditEventType.SOLVENCY_TEST_CONDUCTED,
      AuditCategory.COMPLIANCE,
      'Solvency test initiated',
      { testType }
    );

    // Calculate current solvency metrics
    const solvencyMetrics = await this.calculateSolvencyMetrics();
    
    // Determine compliance status
    const complianceStatus = this.determineComplianceStatus(solvencyMetrics.capitalAdequacy.solvencyRatio);

    const solvencyTest = new this.solvencyTestModel({
      testId: this.generateTestId(),
      testType,
      testDate: new Date(),
      reportingPeriod: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        endDate: new Date()
      },
      capitalAdequacy: solvencyMetrics.capitalAdequacy,
      riskMetrics: solvencyMetrics.riskMetrics,
      complianceStatus,
      regulatoryRequirements: {
        jurisdiction: 'Global',
        regulatorId: 'REG001',
        minimumSolvencyRatio: 1.5,
        capitalBufferRequirement: 0.25,
        testingFrequency: 'monthly',
        reportingDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    const savedTest = await solvencyTest.save();

    // Emit solvency test result
    this.eventEmitter.emit('solvency.test_completed', {
      testId: savedTest.testId,
      solvencyRatio: solvencyMetrics.capitalAdequacy.solvencyRatio,
      complianceStatus
    });

    return savedTest;
  }

  /**
   * Create comprehensive audit trail entry
   */
  async createAuditEntry(
    eventType: AuditEventType,
    category: AuditCategory,
    description: string,
    data?: any,
    severity: AuditSeverity = AuditSeverity.INFO,
    userId?: string
  ): Promise<AuditTrailDocument> {
    
    const auditEntry = new this.auditTrailModel({
      auditId: this.generateAuditId(),
      eventType,
      severity,
      category,
      timestamp: new Date(),
      description,
      context: userId ? {
        userId,
        sessionId: `sess_${Date.now()}`,
        ipAddress: '0.0.0.0', // Would be populated from request
        requestId: `req_${Date.now()}`
      } : undefined,
      auditData: data ? {
        parameters: data,
        result: 'success'
      } : undefined,
      complianceFlags: {
        gdprRelevant: false,
        pciRelevant: false,
        soxRelevant: true,
        regulatoryRelevant: true,
        retentionPeriod: 2555, // 7 years
        encryptionRequired: false
      }
    });

    const savedAudit = await auditEntry.save();

    // In real implementation, would also record to HCS for immutability
    // await this.recordToBlockchain(savedAudit);

    return savedAudit;
  }

  /**
   * Calculate current solvency metrics
   */
  private async calculateSolvencyMetrics(): Promise<any> {
    // Mock calculation - in real implementation would aggregate from all modules
    const totalAssets = 10000000;
    const totalLiabilities = 6000000;
    const netAssets = totalAssets - totalLiabilities;
    const minimumCapitalRequirement = 2000000;
    const solvencyRatio = netAssets / minimumCapitalRequirement;

    return {
      capitalAdequacy: {
        totalAssets,
        totalLiabilities,
        netAssets,
        minimumCapitalRequirement,
        solvencyCapitalRequirement: minimumCapitalRequirement * 1.5,
        capitalBuffer: netAssets - minimumCapitalRequirement,
        solvencyRatio,
        excessCapital: Math.max(0, netAssets - minimumCapitalRequirement),
        capitalDeficiency: Math.max(0, minimumCapitalRequirement - netAssets)
      },
      riskMetrics: {
        underwritingRisk: 0.15,
        marketRisk: 0.08,
        creditRisk: 0.05,
        operationalRisk: 0.03,
        liquidityRisk: 0.04,
        concentrationRisk: 0.12,
        catastropheRisk: 0.20,
        totalRisk: 0.67
      }
    };
  }

  /**
   * Determine compliance status based on solvency ratio
   */
  private determineComplianceStatus(solvencyRatio: number): ComplianceStatus {
    if (solvencyRatio >= 2.0) return ComplianceStatus.COMPLIANT;
    if (solvencyRatio >= 1.5) return ComplianceStatus.WARNING;
    if (solvencyRatio >= 1.0) return ComplianceStatus.NON_COMPLIANT;
    return ComplianceStatus.CRITICAL;
  }

  /**
   * Get audit trail for specific time period
   */
  async getAuditTrail(
    startDate: Date,
    endDate: Date,
    eventTypes?: AuditEventType[],
    categories?: AuditCategory[]
  ): Promise<AuditTrailDocument[]> {
    const filter: any = {
      timestamp: { $gte: startDate, $lte: endDate }
    };

    if (eventTypes) {
      filter.eventType = { $in: eventTypes };
    }

    if (categories) {
      filter.category = { $in: categories };
    }

    return await this.auditTrailModel.find(filter).sort({ timestamp: -1 });
  }

  /**
   * Generate immutable hash for audit records
   */
  generateImmutableHash(auditData: any): string {
    // Mock hash generation - in real implementation would use proper cryptographic hash
    return `hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set up event listeners for automatic audit trail
   */
  private setupAuditListeners(): void {
    // Listen to various system events and create audit trails
    this.eventEmitter.on('policy.created', (data) => {
      this.createAuditEntry(
        AuditEventType.POLICY_CREATED,
        AuditCategory.POLICY_MANAGEMENT,
        `Policy created: ${data.policyId}`,
        data
      );
    });

    this.eventEmitter.on('trigger.validated', (data) => {
      this.createAuditEntry(
        AuditEventType.TRIGGER_VALIDATED,
        AuditCategory.CLAIMS_PROCESSING,
        `Trigger validated: ${data.triggerId}`,
        data
      );
    });

    this.eventEmitter.on('payout.completed', (data) => {
      this.createAuditEntry(
        AuditEventType.PAYOUT_EXECUTED,
        AuditCategory.FINANCIAL_TRANSACTION,
        `Payout executed: ${data.payoutId} - Amount: ${data.amount}`,
        data
      );
    });

    this.eventEmitter.on('cession.completed', (data) => {
      this.createAuditEntry(
        AuditEventType.CESSION_PROCESSED,
        AuditCategory.RISK_MANAGEMENT,
        `Cession processed: ${data.cessionId} - Amount: ${data.amount}`,
        data
      );
    });
  }

  // Helper methods
  private generateTestId(): string {
    return `SOL${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }

  private generateAuditId(): string {
    return `AUD${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }
}
