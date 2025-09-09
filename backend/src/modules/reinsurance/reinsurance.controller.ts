import { Controller, Get, Post, Put, Body, Param, Query, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ReinsuranceService } from './reinsurance.service';
import { ReinsurerContract } from './schemas/reinsurer-contract.schema';
import { RecoveryType } from './schemas/reinsurance-recovery.schema';

@ApiTags('Reinsurance & Cession Management')
@Controller('reinsurance')
export class ReinsuranceController {
  private readonly logger = new Logger(ReinsuranceController.name);

  constructor(private readonly reinsuranceService: ReinsuranceService) {}

  @Post('contracts')
  @ApiOperation({ summary: 'Create a new reinsurance contract' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Contract created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid contract data' })
  async createContract(@Body() contractData: Partial<ReinsurerContract>) {
    this.logger.log(`Creating reinsurance contract for: ${contractData.reinsurerName}`);
    return await this.reinsuranceService.createReinsurerContract(contractData);
  }

  @Post('cessions/automated')
  @ApiOperation({ summary: 'Process automated cession to reinsurer (from diagram)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Automated cession processed successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid cession request' })
  async processAutomatedCession(@Body() cessionRequest: {
    policyId: string;
    claimAmount: number;
    payoutId: string;
  }) {
    this.logger.log(`Processing automated cession for policy: ${cessionRequest.policyId}`);
    
    return await this.reinsuranceService.processAutomatedCession(
      cessionRequest.policyId,
      cessionRequest.claimAmount,
      cessionRequest.payoutId
    );
  }

  @Post('recovery/submit')
  @ApiOperation({ summary: 'Submit reinsurance recovery claim' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Recovery claim submitted successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid recovery claim data' })
  async submitRecoveryClaim(@Body() recoveryData: {
    contractId: string;
    claimId: string;
    policyId: string;
    claimAmount: number;
    recoveryType: RecoveryType;
  }) {
    this.logger.log(`Submitting recovery claim for contract: ${recoveryData.contractId}`);
    
    return await this.reinsuranceService.submitRecoveryCllaim(
      recoveryData.contractId,
      recoveryData.claimId,
      recoveryData.policyId,
      recoveryData.claimAmount,
      recoveryData.recoveryType
    );
  }

  @Get('analytics/cessions')
  @ApiOperation({ summary: 'Get cession analytics and performance metrics' })
  @ApiQuery({ name: 'contractId', required: false, description: 'Filter by contract ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cession analytics retrieved successfully' })
  async getCessionAnalytics(@Query('contractId') contractId?: string) {
    this.logger.log('Retrieving cession analytics');
    return await this.reinsuranceService.getCessionAnalytics(contractId);
  }

  @Get('contracts')
  @ApiOperation({ summary: 'Get list of reinsurance contracts' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by contract status' })
  @ApiQuery({ name: 'treatyType', required: false, description: 'Filter by treaty type' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Contract list retrieved successfully' })
  async getContracts(
    @Query('status') status?: string,
    @Query('treatyType') treatyType?: string
  ) {
    // Mock response - implementation would query actual contracts
    return {
      contracts: [
        {
          contractId: 'CON001',
          reinsurerId: 'REIN001',
          reinsurerName: 'Global Re Ltd',
          treatyType: 'quota_share',
          status: 'active',
          cessionPercentage: 25,
          effectiveDate: new Date(),
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          totalCapacity: 5000000,
          utilizationRate: 0.35
        },
        {
          contractId: 'CON002',
          reinsurerId: 'REIN002',
          reinsurerName: 'Catastrophe Re Inc',
          treatyType: 'excess_of_loss',
          status: 'active',
          attachmentPoint: 1000000,
          limit: 10000000,
          effectiveDate: new Date(),
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          utilizationRate: 0.15
        }
      ],
      totalCount: 2,
      filters: { status, treatyType }
    };
  }

  @Get('contracts/:contractId')
  @ApiOperation({ summary: 'Get detailed contract information' })
  @ApiParam({ name: 'contractId', description: 'Contract ID to retrieve' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Contract details retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Contract not found' })
  async getContractDetails(@Param('contractId') contractId: string) {
    // Mock detailed contract response
    return {
      contractId,
      reinsurerId: 'REIN001',
      reinsurerName: 'Global Re Ltd',
      reinsurerAccountId: '0.0.456789',
      reinsurerWalletAddress: '0.0.456789',
      treatyType: 'quota_share',
      status: 'active',
      effectiveDate: new Date(),
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      treatyTerms: {
        cessionPercentage: 25,
        retentionLimit: 2000000,
        commissionRate: 15,
        profitSharing: {
          profitThreshold: 0.10,
          cedentShare: 75,
          reinsurerShare: 25
        }
      },
      financialTerms: {
        currency: 'HBAR',
        premiumPaymentTerms: 'Quarterly',
        claimPaymentTerms: '30 days',
        securityArrangements: {
          letterOfCredit: 1000000,
          trustFund: 500000
        }
      },
      performanceMetrics: {
        totalPremiumCeded: 1250000,
        totalClaimsRecovered: 450000,
        lossRatio: 0.36,
        profitMargin: 0.18,
        timeToPay: 28,
        disputeRate: 0.02,
        solvencyRatio: 2.15,
        creditRating: 'AA-'
      }
    };
  }

  @Get('cessions')
  @ApiOperation({ summary: 'Get list of cession transactions' })
  @ApiQuery({ name: 'contractId', required: false, description: 'Filter by contract ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by transaction status' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by cession type' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cession list retrieved successfully' })
  async getCessions(
    @Query('contractId') contractId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string
  ) {
    // Mock cession transactions
    return {
      cessions: [
        {
          cessionId: 'CES001',
          contractId: 'CON001',
          reinsurerId: 'REIN001',
          policyId: 'POL123456',
          payoutId: 'PAY789012',
          cessionType: 'claim_recovery',
          status: 'completed',
          cessionAmount: 125000,
          recoveryAmount: 106250,
          initiatedTimestamp: new Date(),
          completedTimestamp: new Date(),
          htsTransactionId: '0.0.123@1234567890.123456789'
        },
        {
          cessionId: 'CES002',
          contractId: 'CON002',
          reinsurerId: 'REIN002',
          policyId: 'POL234567',
          payoutId: 'PAY890123',
          cessionType: 'claim_recovery',
          status: 'executing',
          cessionAmount: 500000,
          recoveryAmount: 475000,
          initiatedTimestamp: new Date()
        }
      ],
      totalCount: 2,
      filters: { contractId, status, type }
    };
  }

  @Get('recovery-claims')
  @ApiOperation({ summary: 'Get list of recovery claims' })
  @ApiQuery({ name: 'contractId', required: false, description: 'Filter by contract ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by recovery status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Recovery claims retrieved successfully' })
  async getRecoveryClaims(
    @Query('contractId') contractId?: string,
    @Query('status') status?: string
  ) {
    // Mock recovery claims
    return {
      recoveryClaims: [
        {
          recoveryId: 'REC001',
          contractId: 'CON001',
          reinsurerId: 'REIN001',
          claimId: 'CLM123456',
          policyId: 'POL123456',
          recoveryType: 'claim_recovery',
          status: 'paid',
          totalClaimAmount: 500000,
          recoveryAmount: 125000,
          netRecovery: 106250,
          submissionDate: new Date(),
          actualPaymentDate: new Date()
        },
        {
          recoveryId: 'REC002',
          contractId: 'CON002',
          reinsurerId: 'REIN002',
          claimId: 'CLM234567',
          policyId: 'POL234567',
          recoveryType: 'catastrophe_recovery',
          status: 'under_review',
          totalClaimAmount: 2000000,
          recoveryAmount: 1000000,
          netRecovery: 950000,
          submissionDate: new Date()
        }
      ],
      totalCount: 2,
      filters: { contractId, status }
    };
  }

  @Get('dashboard/analytics')
  @ApiOperation({ summary: 'Get reinsurance dashboard analytics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dashboard analytics retrieved successfully' })
  async getReinsuranceDashboard() {
    // Mock dashboard analytics
    return {
      portfolioOverview: {
        totalContracts: 5,
        activeContracts: 4,
        totalCapacity: 25000000,
        utilizedCapacity: 8750000,
        utilizationRate: 0.35,
        averageCessionRate: 0.28
      },
      performanceMetrics: {
        totalPremiumsCeded: 5250000,
        totalClaimsRecovered: 1890000,
        netCessionResult: 3360000,
        overallLossRatio: 0.36,
        averageRecoveryTime: 32, // days
        recoverySuccessRate: 0.94
      },
      riskMetrics: {
        totalRiskExposure: 75000000,
        cededRiskExposure: 21000000,
        retainedRiskExposure: 54000000,
        concentrationRisk: 0.18,
        diversificationBenefit: 0.25
      },
      financialHealth: {
        cashFlow: {
          premiumsIn: 7500000,
          premiumsOut: 5250000,
          claimsIn: 1890000,
          claimsOut: 6300000,
          netCashFlow: -2160000
        },
        creditExposure: {
          totalExposure: 21000000,
          securedAmount: 15750000,
          unsecuredAmount: 5250000,
          averageCreditRating: 'AA-'
        }
      },
      treaties: {
        quotaShare: { count: 2, capacity: 10000000, utilization: 0.42 },
        surplus: { count: 1, capacity: 5000000, utilization: 0.28 },
        excessOfLoss: { count: 2, capacity: 10000000, utilization: 0.31 }
      },
      trends: {
        monthlyCessions: [450000, 520000, 380000, 610000, 495000, 540000],
        monthlyRecoveries: [120000, 180000, 95000, 230000, 155000, 210000],
        utilizationTrends: [0.32, 0.34, 0.31, 0.37, 0.33, 0.35]
      },
      timestamp: new Date()
    };
  }

  @Get('compliance/report')
  @ApiOperation({ summary: 'Get reinsurance compliance report' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for report' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for report' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Compliance report retrieved successfully' })
  async getComplianceReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    // Mock compliance report
    return {
      reportPeriod: { startDate, endDate },
      contractCompliance: {
        totalContracts: 5,
        compliantContracts: 5,
        nonCompliantContracts: 0,
        complianceRate: 1.0,
        expiringSoon: 1, // Within 90 days
        renewalActions: ['CON003 requires renewal terms negotiation']
      },
      regulatoryCompliance: {
        jurisdiction: 'Multiple',
        reportingRequirements: {
          quarterly: { required: 4, completed: 4 },
          annual: { required: 1, completed: 1 },
          adhoc: { required: 2, completed: 2 }
        },
        complianceScore: 1.0
      },
      creditManagement: {
        creditChecks: {
          totalReinsuers: 4,
          currentRatings: { 'AAA': 1, 'AA+': 1, 'AA-': 2 },
          downgrades: 0,
          upgrades: 1,
          watchList: 0
        },
        securityArrangements: {
          lettersOfCredit: 3500000,
          trustFunds: 1500000,
          collateral: 750000,
          totalSecurity: 5750000
        }
      },
      auditTrail: {
        totalEvents: 1847,
        criticalEvents: 0,
        warningEvents: 5,
        infoEvents: 1842,
        lastAuditDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        nextAuditDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      },
      riskManagement: {
        concentrationLimits: {
          perReinsurer: { limit: 0.40, current: 0.32 },
          perTreaty: { limit: 0.25, current: 0.18 },
          geographic: { limit: 0.50, current: 0.35 }
        },
        stressTests: {
          lastTestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          passedTests: 8,
          failedTests: 0,
          nextTestDue: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
        }
      },
      timestamp: new Date()
    };
  }
}
