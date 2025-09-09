import { Controller, Get, Post, Body, Query, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SolvencyAuditService } from './solvency-audit.service';
import { SolvencyTestType } from './schemas/solvency-test.schema';
import { AuditEventType, AuditCategory } from './schemas/audit-trail.schema';

@ApiTags('Solvency Testing & Audit Trail')
@Controller('solvency-audit')
export class SolvencyAuditController {
  private readonly logger = new Logger(SolvencyAuditController.name);

  constructor(private readonly solvencyAuditService: SolvencyAuditService) {}

  @Post('solvency-test')
  @ApiOperation({ summary: 'Conduct real-time solvency test (from diagram)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Solvency test completed successfully' })
  async conductSolvencyTest(@Body() testRequest: {
    testType?: SolvencyTestType;
  }) {
    this.logger.log(`Conducting solvency test: ${testRequest.testType || 'routine'}`);
    return await this.solvencyAuditService.conductSolvencyTest(testRequest.testType);
  }

  @Get('audit-trail')
  @ApiOperation({ summary: 'Get comprehensive audit trail' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for audit trail' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for audit trail' })
  @ApiQuery({ name: 'eventTypes', required: false, description: 'Filter by event types' })
  @ApiQuery({ name: 'categories', required: false, description: 'Filter by categories' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Audit trail retrieved successfully' })
  async getAuditTrail(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('eventTypes') eventTypes?: string,
    @Query('categories') categories?: string
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const eventTypesList = eventTypes ? eventTypes.split(',') as AuditEventType[] : undefined;
    const categoriesList = categories ? categories.split(',') as AuditCategory[] : undefined;

    return await this.solvencyAuditService.getAuditTrail(start, end, eventTypesList, categoriesList);
  }

  @Get('compliance-dashboard')
  @ApiOperation({ summary: 'Get solvency and compliance dashboard' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Compliance dashboard retrieved successfully' })
  async getComplianceDashboard() {
    // Mock compliance dashboard
    return {
      solvencyMetrics: {
        currentSolvencyRatio: 2.15,
        minimumRequired: 1.50,
        capitalBuffer: 4000000,
        complianceStatus: 'compliant',
        lastTestDate: new Date(),
        nextTestDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      auditMetrics: {
        totalAuditEvents: 15420,
        criticalEvents: 0,
        warningEvents: 23,
        complianceScore: 0.96,
        auditCoverage: 0.98,
        lastAuditDate: new Date()
      },
      riskMetrics: {
        totalRiskExposure: 75000000,
        mitigatedRisk: 52500000,
        residualRisk: 22500000,
        riskConcentration: 0.18,
        diversificationBenefit: 0.30
      },
      regulatoryStatus: {
        reportsDue: 2,
        reportsOverdue: 0,
        complianceRating: 'AA-',
        lastRegulatoryReview: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      },
      stressTestResults: {
        lastStressTestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        scenariosTested: 5,
        scenariosPassed: 4,
        worstCaseScenario: {
          name: '1-in-100 Year Event',
          solvencyRatio: 1.23,
          passed: false,
          capitalShortfall: 150000
        }
      },
      trends: {
        solvencyRatioHistory: [2.05, 2.12, 2.08, 2.15, 2.13, 2.15],
        complianceScoreHistory: [0.94, 0.95, 0.96, 0.95, 0.96, 0.96],
        auditEventTrends: [1250, 1180, 1320, 1290, 1350, 1280]
      },
      timestamp: new Date()
    };
  }

  @Get('regulatory-reports')
  @ApiOperation({ summary: 'Get regulatory reporting status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Regulatory reports retrieved successfully' })
  async getRegulatoryReports() {
    // Mock regulatory reports
    return {
      upcomingReports: [
        {
          reportType: 'quarterly_financial',
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          status: 'in_preparation',
          regulator: 'Financial Services Authority',
          priority: 'high'
        },
        {
          reportType: 'solvency_report',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'not_started',
          regulator: 'Insurance Regulatory Board',
          priority: 'medium'
        }
      ],
      submittedReports: [
        {
          reportType: 'annual_statement',
          submissionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          status: 'acknowledged',
          regulator: 'Central Financial Authority',
          acknowledgmentDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
        }
      ],
      complianceMetrics: {
        onTimeSubmissions: 0.94,
        averageProcessingTime: 5.2, // days
        regulatorSatisfactionScore: 4.2, // out of 5
        outstandingRequests: 1
      }
    };
  }

  @Get('immutable-records')
  @ApiOperation({ summary: 'Get blockchain-verified audit records' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records to return' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Immutable records retrieved successfully' })
  async getImmutableRecords(@Query('limit') limit?: number) {
    const recordLimit = limit ? parseInt(limit.toString()) : 50;
    
    // Mock immutable records
    return {
      records: Array.from({ length: recordLimit }, (_, i) => ({
        auditId: `AUD${Date.now() - i * 60000}`,
        eventType: 'payout_executed',
        timestamp: new Date(Date.now() - i * 60000),
        blockchainRecord: {
          hcsTopicId: '0.0.12345',
          hcsMessageId: `0.0.123@${Date.now() - i * 60000}.${i}`,
          consensusTimestamp: new Date(Date.now() - i * 60000),
          messageHash: `hash_${Date.now()}_${i}`,
          verified: true
        },
        description: `Audit event ${i + 1}`,
        immutable: true
      })),
      totalRecords: 15420,
      verificationStatus: {
        totalVerified: 15420,
        verificationRate: 1.0,
        lastVerification: new Date(),
        blockchainHealth: 'healthy'
      }
    };
  }
}
