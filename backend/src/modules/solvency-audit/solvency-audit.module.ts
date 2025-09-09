import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SolvencyAuditService } from './solvency-audit.service';
import { SolvencyAuditController } from './solvency-audit.controller';
import { SolvencyTest, SolvencyTestSchema } from './schemas/solvency-test.schema';
import { AuditTrail, AuditTrailSchema } from './schemas/audit-trail.schema';
import { RegulatoryReport, RegulatoryReportSchema } from './schemas/regulatory-report.schema';
import { ComplianceMonitoring, ComplianceMonitoringSchema } from './schemas/compliance-monitoring.schema';

/**
 * @class SolvencyAuditModule
 * @description Solvency Testing and Audit Trail Management for regulatory compliance
 * 
 * This module handles:
 * - Real-time solvency monitoring and testing
 * - Comprehensive audit trail for all system operations
 * - Regulatory reporting and compliance management
 * - Stress testing and scenario analysis
 * - Risk assessment and capital adequacy calculations
 * - Immutable audit records via Hedera Consensus Service
 * - Treaty terms compliance validation
 * - Financial health monitoring and alerting
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SolvencyTest.name, schema: SolvencyTestSchema },
      { name: AuditTrail.name, schema: AuditTrailSchema },
      { name: RegulatoryReport.name, schema: RegulatoryReportSchema },
      { name: ComplianceMonitoring.name, schema: ComplianceMonitoringSchema }
    ])
  ],
  controllers: [SolvencyAuditController],
  providers: [SolvencyAuditService],
  exports: [SolvencyAuditService]
})
export class SolvencyAuditModule {}
