import { Controller, Get, Post, Put, Body, Param, Query, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PolicyWorkflowService } from './policy-workflow.service';
import { Policy } from './schemas/policy.schema';
import { Trigger } from './schemas/trigger.schema';

/**
 * @class PolicyWorkflowController
 * @description REST API controller for parametric insurance policy workflow operations
 * 
 * This controller provides HTTP endpoints for managing the complete parametric insurance
 * lifecycle including policy creation, trigger event processing, payout management,
 * and regulatory compliance operations. All endpoints are documented with Swagger/OpenAPI
 * for automatic API documentation generation.
 * 
 * @example
 * ```typescript
 * // Create a new policy
 * POST /policy-workflow/policies
 * {
 *   "beneficiaryAccountId": "0.0.123456",
 *   "policyType": "weather",
 *   "coverageDetails": { "maxPayout": 10000, "currency": "USD" }
 * }
 * ```
 */
@ApiTags('Policy Workflow Engine')
@Controller('policy-workflow')
export class PolicyWorkflowController {
  private readonly logger = new Logger(PolicyWorkflowController.name);

  /**
   * @constructor
   * @param policyWorkflowService - Injected service for policy workflow operations
   */
  constructor(private readonly policyWorkflowService: PolicyWorkflowService) {}

  /**
   * @method createPolicy
   * @description Create a new parametric insurance policy
   * 
   * Creates a new parametric insurance policy with the provided data. The policy
   * is initially created in DRAFT status and must be activated separately.
   * 
   * @param policyData - Partial policy data including beneficiary, coverage details, and trigger conditions
   * @returns Promise<PolicyDocument> - The created policy document
   * 
   * @example
   * ```typescript
   * const policy = await controller.createPolicy({
   *   beneficiaryAccountId: "0.0.123456",
   *   policyType: PolicyType.WEATHER,
   *   coverageDetails: { maxPayout: 10000, currency: "USD" }
   * });
   * ```
   */
  @Post('policies')
  @ApiOperation({ summary: 'Create a new parametric insurance policy' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Policy created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid policy data' })
  async createPolicy(@Body() policyData: Partial<Policy>) {
    this.logger.log(`Creating policy for beneficiary: ${policyData.beneficiaryAccountId}`);
    return await this.policyWorkflowService.createPolicy(policyData);
  }

  /**
   * @method activatePolicy
   * @description Activate a policy (move from DRAFT to ACTIVE)
   * 
   * Changes the policy status from DRAFT to ACTIVE, making it eligible for
   * trigger event processing and automated payouts.
   * 
   * @param policyId - The unique identifier of the policy to activate
   * @returns Promise<PolicyDocument> - The activated policy document
   * 
   * @example
   * ```typescript
   * const activatedPolicy = await controller.activatePolicy('policy123');
   * ```
   */
  @Put('policies/:policyId/activate')
  @ApiOperation({ summary: 'Activate a policy (move from DRAFT to ACTIVE)' })
  @ApiParam({ name: 'policyId', description: 'Policy ID to activate' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Policy activated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Policy not found' })
  async activatePolicy(@Param('policyId') policyId: string) {
    this.logger.log(`Activating policy: ${policyId}`);
    return await this.policyWorkflowService.activatePolicy(policyId);
  }

  /**
   * @method submitTriggerEvent
   * @description Submit trigger event from oracle committee
   * 
   * Processes a trigger event submitted by the oracle committee. The event
   * is validated against policy conditions and may trigger automated payouts.
   * 
   * @param triggerData - Partial trigger data including policy ID, event data, and source
   * @returns Promise<TriggerDocument> - The processed trigger document
   * 
   * @example
   * ```typescript
   * const trigger = await controller.submitTriggerEvent({
   *   policyId: 'policy123',
   *   source: TriggerSource.ORACLE_COMMITTEE,
   *   eventData: { parameter: 'temperature', value: 35, unit: 'celsius' }
   * });
   * ```
   */
  @Post('triggers')
  @ApiOperation({ summary: 'Submit trigger event from oracle committee' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Trigger event processed successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid trigger data' })
  async submitTriggerEvent(@Body() triggerData: Partial<Trigger>) {
    this.logger.log(`Processing trigger event for policy: ${triggerData.policyId}`);
    return await this.policyWorkflowService.processTriggerEvent(triggerData);
  }

  /**
   * @method conductSolvencyTest
   * @description Conduct solvency test for regulatory compliance
   * 
   * Performs a comprehensive solvency test to ensure the system meets regulatory
   * requirements. Calculates solvency ratios and risk metrics.
   * 
   * @returns Promise<any> - Solvency test results including ratios and compliance status
   * 
   * @example
   * ```typescript
   * const solvencyResult = await controller.conductSolvencyTest();
   * console.log(`Solvency ratio: ${solvencyResult.solvencyRatio}`);
   * ```
   */
  @Post('solvency-test')
  @ApiOperation({ summary: 'Conduct solvency test for regulatory compliance' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Solvency test completed successfully' })
  async conductSolvencyTest() {
    this.logger.log('Conducting solvency test');
    return await this.policyWorkflowService.conductSolvencyTest();
  }

  /**
   * @method getPolicyStatus
   * @description Get policy status and details
   * 
   * Retrieves the current status and key details of a specific policy.
   * 
   * @param policyId - The unique identifier of the policy to query
   * @returns Promise<any> - Policy status and details
   * 
   * @example
   * ```typescript
   * const status = await controller.getPolicyStatus('policy123');
   * console.log(`Policy status: ${status.status}`);
   * ```
   */
  @Get('policies/:policyId/status')
  @ApiOperation({ summary: 'Get policy status and details' })
  @ApiParam({ name: 'policyId', description: 'Policy ID to query' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Policy status retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Policy not found' })
  async getPolicyStatus(@Param('policyId') policyId: string) {
    const policy = await this.policyWorkflowService.getPolicyById(policyId);
    
    if (!policy) {
      return { error: 'Policy not found', policyId };
    }
    
    return {
      policyId: policy._id,
      status: policy.status,
      policyNumber: policy.policyNumber,
      policyType: policy.policyType,
      effectiveDate: policy.effectiveDate,
      expirationDate: policy.expirationDate,
      beneficiaryAccountId: policy.beneficiaryAccountId
    };
  }

  /**
   * @method getPolicyTriggers
   * @description Get all trigger events for a policy
   * 
   * Retrieves all trigger events associated with a specific policy.
   * 
   * @param policyId - The unique identifier of the policy to query triggers for
   * @returns Promise<any> - Array of trigger events for the policy
   * 
   * @example
   * ```typescript
   * const triggers = await controller.getPolicyTriggers('policy123');
   * console.log(`Found ${triggers.triggers.length} triggers`);
   * ```
   */
  @Get('policies/:policyId/triggers')
  @ApiOperation({ summary: 'Get all trigger events for a policy' })
  @ApiParam({ name: 'policyId', description: 'Policy ID to query triggers for' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Trigger events retrieved successfully' })
  async getPolicyTriggers(@Param('policyId') policyId: string) {
    const triggers = await this.policyWorkflowService.getTriggersByPolicyId(policyId);
    
    return {
      policyId,
      triggers: triggers.map(trigger => ({
        triggerId: trigger._id,
        status: trigger.status,
        source: trigger.source,
        eventTimestamp: trigger.eventTimestamp,
        reportedTimestamp: trigger.reportedTimestamp,
        eventData: trigger.eventData
      })),
      count: triggers.length
    };
  }

  /**
   * @method getPolicyPayouts
   * @description Get all payouts for a policy
   * 
   * Retrieves all payout records associated with a specific policy.
   * 
   * @param policyId - The unique identifier of the policy to query payouts for
   * @returns Promise<any> - Array of payout records for the policy
   * 
   * @example
   * ```typescript
   * const payouts = await controller.getPolicyPayouts('policy123');
   * console.log(`Found ${payouts.payouts.length} payouts`);
   * ```
   */
  @Get('policies/:policyId/payouts')
  @ApiOperation({ summary: 'Get all payouts for a policy' })
  @ApiParam({ name: 'policyId', description: 'Policy ID to query payouts for' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payouts retrieved successfully' })
  async getPolicyPayouts(@Param('policyId') policyId: string) {
    const payouts = await this.policyWorkflowService.getPayoutsByPolicyId(policyId);
    
    return {
      policyId,
      payouts: payouts.map(payout => ({
        payoutId: payout._id,
        status: payout.status,
        payoutType: payout.payoutType,
        calculation: payout.calculation,
        calculationTimestamp: payout.calculationTimestamp,
        executionTimestamp: payout.executionTimestamp
      })),
      count: payouts.length
    };
  }

  /**
   * @method getDashboardAnalytics
   * @description Get policy workflow analytics dashboard data
   * 
   * Retrieves aggregated analytics data for the policy workflow dashboard,
   * including policy counts, payout statistics, and risk metrics.
   * 
   * @returns Promise<any> - Dashboard analytics data
   * 
   * @example
   * ```typescript
   * const analytics = await controller.getDashboardAnalytics();
   * console.log(`Total policies: ${analytics.totalPolicies}`);
   * ```
   */
  @Get('analytics/dashboard')
  @ApiOperation({ summary: 'Get policy workflow analytics dashboard data' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dashboard data retrieved successfully' })
  async getDashboardAnalytics() {
    // Mock dashboard data - in reality would aggregate real metrics
    return {
      totalPolicies: 150,
      activePolicies: 142,
      triggeredPolicies: 8,
      totalPayouts: 75000,
      solvencyRatio: 1.85,
      riskPoolUtilization: 0.65,
      reinsuranceCoverage: 0.40,
      timestamp: new Date()
    };
  }

  /**
   * @method getRiskPoolHealth
   * @description Get risk pool health metrics
   * 
   * Retrieves comprehensive health metrics for the risk pool including
   * liquidity, utilization rates, and stress test results.
   * 
   * @returns Promise<any> - Risk pool health metrics and stress test results
   * 
   * @example
   * ```typescript
   * const health = await controller.getRiskPoolHealth();
   * console.log(`Utilization rate: ${health.utilizationRate}`);
   * ```
   */
  @Get('health/risk-pool')
  @ApiOperation({ summary: 'Get risk pool health metrics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Risk pool health retrieved successfully' })
  async getRiskPoolHealth() {
    // Mock risk pool health data
    return {
      totalLiquidity: 1000000,
      availableLiquidity: 650000,
      utilizationRate: 0.35,
      concentrationRisk: 0.15,
      diversificationScore: 0.8,
      stressTestResults: {
        oneInTenYear: { passedTest: true, cushion: 0.25 },
        oneInFiftyYear: { passedTest: true, cushion: 0.10 },
        oneInHundredYear: { passedTest: false, cushion: -0.05 }
      },
      timestamp: new Date()
    };
  }

  /**
   * @method getAuditTrail
   * @description Get audit trail for regulatory compliance
   * 
   * Retrieves a comprehensive audit trail of all system events for regulatory
   * compliance purposes. Supports optional date filtering.
   * 
   * @param startDate - Optional start date for filtering audit events
   * @param endDate - Optional end date for filtering audit events
   * @returns Promise<any> - Audit trail data with events and compliance score
   * 
   * @example
   * ```typescript
   * const auditTrail = await controller.getAuditTrail('2024-01-01', '2024-12-31');
   * console.log(`Compliance score: ${auditTrail.complianceScore}`);
   * ```
   */
  @Get('compliance/audit-trail')
  @ApiOperation({ summary: 'Get audit trail for regulatory compliance' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for audit trail' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for audit trail' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Audit trail retrieved successfully' })
  async getAuditTrail(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    // Mock audit trail data
    return {
      period: { startDate, endDate },
      auditEvents: [
        {
          timestamp: new Date(),
          eventType: 'policy_created',
          policyId: 'POL123456',
          actorId: 'insurer_001',
          details: 'New weather insurance policy created'
        },
        {
          timestamp: new Date(),
          eventType: 'trigger_validated',
          triggerId: 'TRG789012',
          validatorId: 'oracle_committee',
          details: 'Temperature trigger event validated'
        },
        {
          timestamp: new Date(),
          eventType: 'payout_executed',
          payoutId: 'PAY345678',
          amount: 50000,
          details: 'Automated payout executed successfully'
        }
      ],
      totalEvents: 3,
      complianceScore: 0.95
    };
  }

  /**
   * @method getAllPolicies
   * @description Get all policies with optional status filtering
   * 
   * Retrieves all policies in the system with optional filtering by status.
   * Demonstrates the service layer's data retrieval capabilities.
   * 
   * @param status - Optional status filter
   * @returns Promise<any> - Array of policies with metadata
   * 
   * @example
   * ```typescript
   * const allPolicies = await controller.getAllPolicies();
   * const activePolicies = await controller.getAllPolicies('active');
   * ```
   */
  @Get('policies')
  @ApiOperation({ summary: 'Get all policies with optional status filtering' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by policy status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Policies retrieved successfully' })
  async getAllPolicies(@Query('status') status?: string) {
    const policies = status 
      ? await this.policyWorkflowService.getPoliciesByStatus(status as any)
      : await this.policyWorkflowService.getPoliciesByStatus(null as any);
    
    return {
      policies: policies.map(policy => ({
        policyId: policy._id,
        policyNumber: policy.policyNumber,
        status: policy.status,
        policyType: policy.policyType,
        beneficiaryAccountId: policy.beneficiaryAccountId,
        effectiveDate: policy.effectiveDate,
        expirationDate: policy.expirationDate
      })),
      count: policies.length,
      filter: status ? { status } : null
    };
  }

  /**
   * @method getPolicyDetails
   * @description Get detailed policy information
   * 
   * Retrieves comprehensive policy details including all related data.
   * Demonstrates the service layer's data aggregation capabilities.
   * 
   * @param policyId - The unique identifier of the policy
   * @returns Promise<any> - Detailed policy information
   * 
   * @example
   * ```typescript
   * const details = await controller.getPolicyDetails('policy123');
   * ```
   */
  @Get('policies/:policyId/details')
  @ApiOperation({ summary: 'Get detailed policy information' })
  @ApiParam({ name: 'policyId', description: 'Policy ID to get details for' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Policy details retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Policy not found' })
  async getPolicyDetails(@Param('policyId') policyId: string) {
    const policy = await this.policyWorkflowService.getPolicyById(policyId);
    
    if (!policy) {
      return { error: 'Policy not found', policyId };
    }
    
    const triggers = await this.policyWorkflowService.getTriggersByPolicyId(policyId);
    const payouts = await this.policyWorkflowService.getPayoutsByPolicyId(policyId);
    
    return {
      policy: {
        policyId: policy._id,
        policyNumber: policy.policyNumber,
        status: policy.status,
        policyType: policy.policyType,
        beneficiaryAccountId: policy.beneficiaryAccountId,
        insurerAccountId: policy.insurerAccountId,
        brokerAccountId: policy.brokerAccountId,
        effectiveDate: policy.effectiveDate,
        expirationDate: policy.expirationDate,
        triggerConditions: policy.triggerConditions,
        premiumStructure: policy.premiumStructure,
        coverageDetails: policy.coverageDetails,
        riskAssessment: policy.riskAssessment,
        riskPoolAllocation: policy.riskPoolAllocation,
        reinsuranceDetails: policy.reinsuranceDetails
      },
      triggers: {
        count: triggers.length,
        events: triggers.map(trigger => ({
          triggerId: trigger._id,
          status: trigger.status,
          source: trigger.source,
          eventTimestamp: trigger.eventTimestamp,
          eventData: trigger.eventData
        }))
      },
      payouts: {
        count: payouts.length,
        events: payouts.map(payout => ({
          payoutId: payout._id,
          status: payout.status,
          payoutType: payout.payoutType,
          calculation: payout.calculation,
          calculationTimestamp: payout.calculationTimestamp
        }))
      }
    };
  }
}
