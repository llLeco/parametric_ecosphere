import { Controller, Get, Post, Put, Body, Param, Query, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AutomatedPayoutService } from './automated-payout.service';

@ApiTags('Automated Payout System')
@Controller('automated-payout')
export class AutomatedPayoutController {
  private readonly logger = new Logger(AutomatedPayoutController.name);

  constructor(private readonly automatedPayoutService: AutomatedPayoutService) {}

  @Post('request')
  @ApiOperation({ summary: 'Request automated payout (requestPayout from diagram)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Payout request initiated successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid payout request' })
  async requestPayout(@Body() payoutRequest: {
    policyId: string;
    payoutAmount: number;
    triggerId: string;
    beneficiaryAccountId: string;
    poolId: string;
  }) {
    this.logger.log(`Processing payout request for policy: ${payoutRequest.policyId}`);
    
    return await this.automatedPayoutService.requestPayout(
      payoutRequest.policyId,
      payoutRequest.payoutAmount,
      payoutRequest.triggerId,
      payoutRequest.beneficiaryAccountId,
      payoutRequest.poolId
    );
  }

  @Get('transactions/:transactionId/status')
  @ApiOperation({ summary: 'Get payout transaction status' })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID to query' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Transaction status retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Transaction not found' })
  async getPayoutStatus(@Param('transactionId') transactionId: string) {
    this.logger.log(`Retrieving payout status for transaction: ${transactionId}`);
    
    const transaction = await this.automatedPayoutService.getPayoutStatus(transactionId);
    if (!transaction) {
      return { error: 'Transaction not found' };
    }
    
    return {
      transactionId: transaction.transactionId,
      policyId: transaction.policyId,
      status: transaction.status,
      payoutAmount: transaction.payoutAmount,
      beneficiaryAccountId: transaction.beneficiaryAccountId,
      initiatedTimestamp: transaction.initiatedTimestamp,
      completedTimestamp: transaction.completedTimestamp,
      finalityConfirmedTimestamp: transaction.finalityConfirmedTimestamp,
      htsDetails: transaction.htsDetails,
      failureReason: transaction.failureReason,
      failureMessage: transaction.failureMessage
    };
  }

  @Post('transactions/:transactionId/retry')
  @ApiOperation({ summary: 'Retry failed payout transaction' })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID to retry' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payout retry initiated successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot retry transaction' })
  async retryFailedPayout(@Param('transactionId') transactionId: string) {
    this.logger.log(`Retrying failed payout: ${transactionId}`);
    
    try {
      await this.automatedPayoutService.retryFailedPayout(transactionId);
      return { message: 'Payout retry initiated successfully' };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get list of payout transactions' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by transaction status' })
  @ApiQuery({ name: 'policyId', required: false, description: 'Filter by policy ID' })
  @ApiQuery({ name: 'beneficiaryAccountId', required: false, description: 'Filter by beneficiary account' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results to return' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Transaction list retrieved successfully' })
  async getPayoutTransactions(
    @Query('status') status?: string,
    @Query('policyId') policyId?: string,
    @Query('beneficiaryAccountId') beneficiaryAccountId?: string,
    @Query('limit') limit?: number
  ) {
    // Mock response - implementation would query actual transactions
    return {
      transactions: [
        {
          transactionId: 'TXN001',
          policyId: 'POL123456',
          beneficiaryAccountId: '0.0.123456',
          payoutAmount: 50000,
          status: 'completed',
          initiatedTimestamp: new Date(),
          completedTimestamp: new Date(),
          htsTransactionId: '0.0.123@1234567890.123456789'
        },
        {
          transactionId: 'TXN002',
          policyId: 'POL789012',
          beneficiaryAccountId: '0.0.789012',
          payoutAmount: 25000,
          status: 'executing',
          initiatedTimestamp: new Date(),
          htsTransactionId: '0.0.124@1234567891.123456790'
        }
      ],
      totalCount: 2,
      filters: { status, policyId, beneficiaryAccountId, limit }
    };
  }

  @Get('liquidity-reservations')
  @ApiOperation({ summary: 'Get liquidity reservations for payouts' })
  @ApiQuery({ name: 'poolId', required: false, description: 'Filter by pool ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by reservation status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Reservations retrieved successfully' })
  async getLiquidityReservations(
    @Query('poolId') poolId?: string,
    @Query('status') status?: string
  ) {
    // Mock response - implementation would query actual reservations
    return {
      reservations: [
        {
          reservationId: 'RSV001',
          poolId: 'POOL001',
          transactionId: 'TXN001',
          reservedAmount: 50000,
          status: 'utilized',
          reservationTimestamp: new Date(),
          utilizationTimestamp: new Date()
        },
        {
          reservationId: 'RSV002',
          poolId: 'POOL001',
          transactionId: 'TXN002',
          reservedAmount: 25000,
          status: 'active',
          reservationTimestamp: new Date()
        }
      ],
      totalReserved: 75000,
      filters: { poolId, status }
    };
  }

  @Get('beneficiary-wallets/:accountId')
  @ApiOperation({ summary: 'Get beneficiary wallet information' })
  @ApiParam({ name: 'accountId', description: 'Beneficiary account ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Wallet information retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Wallet not found' })
  async getBeneficiaryWallet(@Param('accountId') accountId: string) {
    // Mock response - implementation would query actual wallet
    return {
      walletId: 'WAL001',
      beneficiaryAccountId: accountId,
      walletAddress: '0.0.123456',
      walletType: 'hedera_native',
      status: 'active',
      validation: {
        isValidAddress: true,
        isActive: true,
        hasRequiredKeys: true,
        kycCompleted: true,
        amlCleared: true,
        sanctionsCheck: true,
        lastValidationDate: new Date(),
        validationScore: 95
      },
      balanceInfo: {
        hbarBalance: 1000,
        tokenBalances: [
          { tokenId: '0.0.123456', balance: 5000, symbol: 'USDC' }
        ],
        lastUpdated: new Date()
      },
      transactionHistory: [
        {
          transactionId: 'TXN001',
          type: 'payout',
          amount: 50000,
          currency: 'HBAR',
          timestamp: new Date(),
          status: 'completed'
        }
      ]
    };
  }

  @Post('beneficiary-wallets/register')
  @ApiOperation({ summary: 'Register a new beneficiary wallet' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Wallet registered successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid wallet data' })
  async registerBeneficiaryWallet(@Body() walletData: {
    beneficiaryAccountId: string;
    walletAddress: string;
    walletType: string;
  }) {
    this.logger.log(`Registering beneficiary wallet for account: ${walletData.beneficiaryAccountId}`);
    
    // Mock wallet registration - implementation would create actual wallet record
    return {
      walletId: `WAL${Date.now()}`,
      beneficiaryAccountId: walletData.beneficiaryAccountId,
      walletAddress: walletData.walletAddress,
      walletType: walletData.walletType,
      status: 'pending_verification',
      registrationDate: new Date(),
      message: 'Wallet registered successfully. Verification in progress.'
    };
  }

  @Get('analytics/dashboard')
  @ApiOperation({ summary: 'Get payout system analytics dashboard' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dashboard analytics retrieved successfully' })
  async getPayoutAnalytics() {
    // Mock analytics dashboard
    return {
      systemMetrics: {
        totalPayouts: 156,
        successfulPayouts: 148,
        failedPayouts: 8,
        successRate: 0.949,
        totalAmountPaid: 7850000,
        averagePayoutAmount: 50320,
        averageProcessingTime: 4.2 // minutes
      },
      liquidityMetrics: {
        totalReservations: 12,
        activeReservations: 3,
        totalReservedAmount: 375000,
        averageReservationTime: 2.8, // hours
        liquidityUtilization: 0.15
      },
      performanceMetrics: {
        averageHTSTransactionTime: 3.1, // seconds
        finalityConfirmationTime: 12.5, // seconds
        walletValidationTime: 1.2, // seconds
        endToEndProcessingTime: 4.2 // minutes
      },
      failureAnalysis: {
        insufficientLiquidity: 3,
        walletValidationFailed: 2,
        htsTransactionFailed: 2,
        networkError: 1,
        totalFailures: 8
      },
      trends: {
        dailyPayouts: [12, 15, 18, 14, 16, 20, 22],
        dailyAmounts: [650000, 780000, 920000, 710000, 850000, 1020000, 1150000],
        successRates: [0.95, 0.93, 0.96, 0.94, 0.95, 0.94, 0.97]
      },
      hederaIntegration: {
        htsTransactionsProcessed: 148,
        totalNetworkFees: 148.5, // HBAR
        averageConfirmationTime: 12.5, // seconds
        finalityThresholdMet: 148,
        networkErrors: 2
      },
      timestamp: new Date()
    };
  }

  @Get('compliance/report')
  @ApiOperation({ summary: 'Get compliance report for payout operations' })
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
      complianceMetrics: {
        totalTransactions: 156,
        kycValidatedTransactions: 156,
        amlClearedTransactions: 154,
        sanctionsCheckedTransactions: 156,
        complianceRate: 0.987
      },
      regulatoryReporting: {
        reportingRequired: 12,
        reportingCompleted: 12,
        reportingPending: 0,
        complianceScore: 1.0
      },
      auditTrail: {
        totalAuditEvents: 1248,
        criticalEvents: 0,
        warningEvents: 3,
        infoEvents: 1245
      },
      riskAssessment: {
        highRiskTransactions: 2,
        mediumRiskTransactions: 15,
        lowRiskTransactions: 139,
        averageRiskScore: 0.15
      },
      timestamp: new Date()
    };
  }
}
