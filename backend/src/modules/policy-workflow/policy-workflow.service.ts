import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Policy, PolicyDocument, PolicyStatus } from './schemas/policy.schema';
import { Trigger, TriggerDocument, TriggerStatus } from './schemas/trigger.schema';
import { Payout, PayoutDocument, PayoutStatus, PayoutType } from './schemas/payout.schema';

/**
 * @class PolicyWorkflowService
 * @description Core service for parametric insurance policy workflow management
 * 
 * This service handles the core business logic for parametric insurance policies including:
 * - Policy CRUD operations and state management
 * - Basic trigger event processing and validation
 * - Essential payout calculations and status management
 * - Data persistence and retrieval operations
 * - Event emission for asynchronous processing
 * 
 * The service follows the single responsibility principle by focusing on:
 * - Data operations and business rules
 * - Event emission for complex processing
 * - Core workflow state management
 * 
 * Complex background processing is handled by PolicyWorkflowConsumer
 * through event-driven architecture.
 * 
 * @example
 * ```typescript
 * // Inject the service
 * constructor(private policyWorkflowService: PolicyWorkflowService) {}
 * 
 * // Create a new policy
 * const policy = await this.policyWorkflowService.createPolicy({
 *   beneficiaryAccountId: '0.0.123456',
 *   policyType: PolicyType.WEATHER
 * });
 * ```
 */
@Injectable()
export class PolicyWorkflowService {
  private readonly logger = new Logger(PolicyWorkflowService.name);

  /**
   * @constructor
   * @param policyModel - Mongoose model for Policy documents
   * @param triggerModel - Mongoose model for Trigger documents
   * @param payoutModel - Mongoose model for Payout documents
   * @param eventEmitter - Event emitter for workflow event notifications
   */
  constructor(
    @InjectModel(Policy.name) private policyModel: Model<PolicyDocument>,
    @InjectModel(Trigger.name) private triggerModel: Model<TriggerDocument>,
    @InjectModel(Payout.name) private payoutModel: Model<PayoutDocument>,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * @method createPolicy
   * @description Create a new parametric insurance policy
   * 
   * Creates a new parametric insurance policy with the provided data. The policy
   * is initially created in DRAFT status and must be activated separately using
   * the activatePolicy method.
   * 
   * @param policyData - Partial policy data including beneficiary, coverage details, and trigger conditions
   * @returns Promise<PolicyDocument> - The created policy document
   * 
   * @emits policy.created - Emitted when a policy is successfully created
   * 
   * @example
   * ```typescript
   * const policy = await this.policyWorkflowService.createPolicy({
   *   beneficiaryAccountId: '0.0.123456',
   *   policyType: PolicyType.WEATHER,
   *   coverageDetails: { maxPayout: 10000, currency: 'USD' }
   * });
   * ```
   */
  async createPolicy(policyData: Partial<Policy>): Promise<PolicyDocument> {
    this.logger.log(`Creating new policy for beneficiary: ${policyData.beneficiaryAccountId}`);
    
    const policy = new this.policyModel({
      ...policyData,
      policyNumber: this.generatePolicyNumber(),
      status: PolicyStatus.DRAFT
    });

    const savedPolicy = await policy.save();
    
    // Emit event for policy creation
    this.eventEmitter.emit('policy.created', { policyId: savedPolicy._id, policy: savedPolicy });
    
    return savedPolicy;
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
   * @throws Error - If the policy is not found
   * @emits policy.activated - Emitted when a policy is successfully activated
   * 
   * @example
   * ```typescript
   * const activatedPolicy = await this.policyWorkflowService.activatePolicy('policy123');
   * ```
   */
  async activatePolicy(policyId: string): Promise<PolicyDocument> {
    this.logger.log(`Activating policy: ${policyId}`);
    
    const policy = await this.policyModel.findByIdAndUpdate(
      policyId,
      { status: PolicyStatus.ACTIVE },
      { new: true }
    );

    if (!policy) {
      throw new Error(`Policy ${policyId} not found`);
    }

    // Emit event for policy activation
    this.eventEmitter.emit('policy.activated', { policyId, policy });
    
    return policy;
  }

  /**
   * @method processTriggerEvent
   * @description Process trigger event from oracle committee
   * 
   * Processes a trigger event submitted by the oracle committee. The event
   * is validated against policy conditions and may trigger automated payouts
   * if conditions are met.
   * 
   * @param triggerData - Partial trigger data including policy ID, event data, and source
   * @returns Promise<TriggerDocument> - The processed trigger document
   * 
   * @emits trigger.received - Emitted when a trigger event is received
   * @emits trigger.validated - Emitted when trigger conditions are validated
   * 
   * @example
   * ```typescript
   * const trigger = await this.policyWorkflowService.processTriggerEvent({
   *   policyId: 'policy123',
   *   source: TriggerSource.ORACLE_COMMITTEE,
   *   eventData: { parameter: 'temperature', value: 35, unit: 'celsius' }
   * });
   * ```
   */
  async processTriggerEvent(triggerData: Partial<Trigger>): Promise<TriggerDocument> {
    this.logger.log(`Processing trigger event for policy: ${triggerData.policyId}`);
    
    const trigger = new this.triggerModel({
      ...triggerData,
      triggerId: this.generateTriggerId(),
      status: TriggerStatus.PENDING,
      reportedTimestamp: new Date()
    });

    const savedTrigger = await trigger.save();
    
    // Emit event for trigger processing
    this.eventEmitter.emit('trigger.received', { triggerId: savedTrigger._id, trigger: savedTrigger });
    
    // Check if trigger conditions are met
    await this.validateTriggerConditions(savedTrigger);
    
    return savedTrigger;
  }

  /**
   * @method validateTriggerConditions
   * @description Validate trigger conditions against policy parameters
   * 
   * Validates whether a trigger event meets the conditions defined in the
   * associated policy. If conditions are met, initiates the automated payout process.
   * 
   * @param trigger - The trigger document to validate
   * @returns Promise<void>
   * 
   * @throws Error - If the associated policy is not found
   * @emits trigger.validated - Emitted when trigger conditions are validated
   * 
   * @example
   * ```typescript
   * await this.policyWorkflowService.validateTriggerConditions(trigger);
   * ```
   */
  async validateTriggerConditions(trigger: TriggerDocument): Promise<void> {
    this.logger.log(`Validating trigger conditions for trigger: ${trigger.triggerId}`);
    
    const policy = await this.policyModel.findById(trigger.policyId);
    if (!policy) {
      throw new Error(`Policy ${trigger.policyId} not found`);
    }

    const { eventData } = trigger;
    const { triggerConditions } = policy;

    // Check each trigger condition
    for (let i = 0; i < triggerConditions.length; i++) {
      const condition = triggerConditions[i];
      
      if (condition.parameter === eventData.parameter) {
        const isMet = this.evaluateCondition(
          eventData.value,
          condition.operator,
          condition.threshold
        );

        if (isMet) {
          // Update trigger with condition met details
          await this.triggerModel.findByIdAndUpdate(trigger._id, {
            status: TriggerStatus.VALIDATED,
            triggerConditionMet: {
              conditionIndex: i,
              thresholdValue: condition.threshold,
              actualValue: eventData.value,
              operator: condition.operator,
              isMet: true
            }
          });

          // Emit event for trigger validation
          this.eventEmitter.emit('trigger.validated', { triggerId: trigger._id, policyId: policy._id });
          
          // Initiate automated payout process
          await this.initiateAutomatedPayout(policy, trigger);
          break;
        }
      }
    }
  }

  /**
   * @method initiateAutomatedPayout
   * @description Initiate automated payout process
   * 
   * Creates a payout record and emits events for complex processing.
   * The actual payout processing is handled asynchronously by the consumer.
   * 
   * @param policy - The policy document that triggered the payout
   * @param trigger - The trigger document that caused the payout
   * @returns Promise<PayoutDocument> - The created payout document
   * 
   * @emits payout.calculated - Emitted when payout calculation is completed
   * 
   * @example
   * ```typescript
   * const payout = await this.policyWorkflowService.initiateAutomatedPayout(policy, trigger);
   * ```
   */
  async initiateAutomatedPayout(policy: PolicyDocument, trigger: TriggerDocument): Promise<PayoutDocument> {
    this.logger.log(`Initiating automated payout for policy: ${policy._id}`);
    
    // Calculate basic payout amount
    const payoutCalculation = this.calculatePayout(policy, trigger);
    
    const payout = new this.payoutModel({
      payoutId: this.generatePayoutId(),
      policyId: policy._id,
      triggerId: trigger._id,
      beneficiaryAccountId: policy.beneficiaryAccountId,
      status: PayoutStatus.CALCULATED,
      payoutType: PayoutType.AUTOMATIC,
      calculation: payoutCalculation,
      calculationTimestamp: new Date()
    });

    const savedPayout = await payout.save();

    // Update policy status
    await this.policyModel.findByIdAndUpdate(policy._id, {
      status: PolicyStatus.TRIGGERED
    });

    // Emit event for consumer to handle complex processing
    this.eventEmitter.emit('payout.calculated', { payoutId: savedPayout._id, policyId: policy._id });
    
    return savedPayout;
  }

  /**
   * @method processAutomatedPayment
   * @description Process automated payment with basic validation
   * 
   * Performs basic validation and emits events for complex processing.
   * The actual payment processing is handled asynchronously by the consumer.
   * 
   * @param payout - The payout document to process
   * @returns Promise<void>
   * 
   * @emits payout.approved - Emitted when payout is approved for execution
   * @emits payout.failed - Emitted when payout processing fails
   * 
   * @example
   * ```typescript
   * await this.policyWorkflowService.processAutomatedPayment(payout);
   * ```
   */
  async processAutomatedPayment(payout: PayoutDocument): Promise<void> {
    this.logger.log(`Processing automated payment for payout: ${payout.payoutId}`);
    
    try {
      // Basic validation
      if (!payout.calculation || payout.calculation.netPayout <= 0) {
        throw new Error('Invalid payout calculation');
      }

      // Update status to processing
      await this.payoutModel.findByIdAndUpdate(payout._id, {
        status: PayoutStatus.PROCESSING
      });

      // Emit event for consumer to handle complex processing
      this.eventEmitter.emit('payout.approved', { payoutId: payout._id });
      
    } catch (error) {
      this.logger.error(`Failed to process payment for payout: ${payout.payoutId}: ${error.message}`);
      
      await this.payoutModel.findByIdAndUpdate(payout._id, {
        status: PayoutStatus.FAILED
      });

      this.eventEmitter.emit('payout.failed', { payoutId: payout._id, reason: error.message });
    }
  }

  /**
   * @method getPolicyById
   * @description Get a policy by its ID
   * 
   * @param policyId - The ID of the policy to retrieve
   * @returns Promise<PolicyDocument | null> - The policy document or null if not found
   * 
   * @example
   * ```typescript
   * const policy = await this.policyWorkflowService.getPolicyById('policy123');
   * ```
   */
  async getPolicyById(policyId: string): Promise<PolicyDocument | null> {
    return await this.policyModel.findById(policyId);
  }

  /**
   * @method getTriggerById
   * @description Get a trigger by its ID
   * 
   * @param triggerId - The ID of the trigger to retrieve
   * @returns Promise<TriggerDocument | null> - The trigger document or null if not found
   * 
   * @example
   * ```typescript
   * const trigger = await this.policyWorkflowService.getTriggerById('trigger123');
   * ```
   */
  async getTriggerById(triggerId: string): Promise<TriggerDocument | null> {
    return await this.triggerModel.findById(triggerId);
  }

  /**
   * @method getPayoutById
   * @description Get a payout by its ID
   * 
   * @param payoutId - The ID of the payout to retrieve
   * @returns Promise<PayoutDocument | null> - The payout document or null if not found
   * 
   * @example
   * ```typescript
   * const payout = await this.policyWorkflowService.getPayoutById('payout123');
   * ```
   */
  async getPayoutById(payoutId: string): Promise<PayoutDocument | null> {
    return await this.payoutModel.findById(payoutId);
  }

  /**
   * @method getPoliciesByStatus
   * @description Get policies by status
   * 
   * @param status - The status to filter by
   * @returns Promise<PolicyDocument[]> - Array of policy documents
   * 
   * @example
   * ```typescript
   * const activePolicies = await this.policyWorkflowService.getPoliciesByStatus(PolicyStatus.ACTIVE);
   * ```
   */
  async getPoliciesByStatus(status: PolicyStatus): Promise<PolicyDocument[]> {
    return await this.policyModel.find({ status });
  }

  /**
   * @method getTriggersByPolicyId
   * @description Get all triggers for a specific policy
   * 
   * @param policyId - The ID of the policy
   * @returns Promise<TriggerDocument[]> - Array of trigger documents
   * 
   * @example
   * ```typescript
   * const triggers = await this.policyWorkflowService.getTriggersByPolicyId('policy123');
   * ```
   */
  async getTriggersByPolicyId(policyId: string): Promise<TriggerDocument[]> {
    return await this.triggerModel.find({ policyId });
  }

  /**
   * @method getPayoutsByPolicyId
   * @description Get all payouts for a specific policy
   * 
   * @param policyId - The ID of the policy
   * @returns Promise<PayoutDocument[]> - Array of payout documents
   * 
   * @example
   * ```typescript
   * const payouts = await this.policyWorkflowService.getPayoutsByPolicyId('policy123');
   * ```
   */
  async getPayoutsByPolicyId(policyId: string): Promise<PayoutDocument[]> {
    return await this.payoutModel.find({ policyId });
  }

  /**
   * @method conductSolvencyTest
   * @description Conduct solvency test for regulatory compliance
   * 
   * Performs a comprehensive solvency test to ensure the system meets regulatory
   * requirements. Calculates solvency ratios, risk metrics, and compliance status.
   * 
   * @returns Promise<any> - Solvency test results including ratios and compliance status
   * 
   * @emits solvency.test_completed - Emitted when solvency test is completed
   * 
   * @example
   * ```typescript
   * const result = await this.policyWorkflowService.conductSolvencyTest();
   * console.log(`Solvency ratio: ${result.solvencyRatio}`);
   * ```
   */
  async conductSolvencyTest(): Promise<any> {
    this.logger.log('Conducting solvency test for regulatory compliance');
    
    // Calculate total assets (pool funds + reinsurance recoverable)
    // Calculate total liabilities (potential payouts)
    // Return solvency ratio and compliance status
    
    // This is a simplified version - in reality would be much more complex
    const activePolicies = await this.policyModel.find({ status: PolicyStatus.ACTIVE });
    const totalLiabilities = activePolicies.reduce((sum, policy) => sum + policy.coverageDetails.maxPayout, 0);
    
    const solvencyResult = {
      testTimestamp: new Date(),
      totalAssets: 1000000, // Mock value
      totalLiabilities,
      solvencyRatio: 1000000 / totalLiabilities,
      isCompliant: (1000000 / totalLiabilities) >= 1.5, // 150% minimum ratio
      riskMetrics: {
        concentrationRisk: 0.1,
        liquidityRisk: 0.05,
        operationalRisk: 0.03
      }
    };

    // Emit solvency test result
    this.eventEmitter.emit('solvency.test_completed', solvencyResult);
    
    return solvencyResult;
  }

  // Helper methods
  /**
   * @method generatePolicyNumber
   * @description Generate a unique policy number
   * 
   * Generates a unique policy number using timestamp and random string.
   * 
   * @returns string - Unique policy number
   * 
   * @private
   */
  private generatePolicyNumber(): string {
    return `POL${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }

  /**
   * @method generateTriggerId
   * @description Generate a unique trigger ID
   * 
   * Generates a unique trigger ID using timestamp and random string.
   * 
   * @returns string - Unique trigger ID
   * 
   * @private
   */
  private generateTriggerId(): string {
    return `TRG${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }

  /**
   * @method generatePayoutId
   * @description Generate a unique payout ID
   * 
   * Generates a unique payout ID using timestamp and random string.
   * 
   * @returns string - Unique payout ID
   * 
   * @private
   */
  private generatePayoutId(): string {
    return `PAY${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }

  /**
   * @method evaluateCondition
   * @description Evaluate a trigger condition
   * 
   * Evaluates whether a trigger condition is met by comparing the actual value
   * with the threshold using the specified operator.
   * 
   * @param value - The actual value from the trigger event
   * @param operator - The comparison operator (gt, gte, lt, lte, eq)
   * @param threshold - The threshold value to compare against
   * @returns boolean - True if condition is met, false otherwise
   * 
   * @private
   */
  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'gt': return value > threshold;
      case 'gte': return value >= threshold;
      case 'lt': return value < threshold;
      case 'lte': return value <= threshold;
      case 'eq': return value === threshold;
      default: return false;
    }
  }

  /**
   * @method calculatePayout
   * @description Calculate payout amount for a policy
   * 
   * Calculates the payout amount based on policy coverage details and
   * trigger event data. Applies deductibles and adjustments.
   * 
   * @param policy - The policy document
   * @param trigger - The trigger document that caused the payout
   * @returns any - Payout calculation details
   * 
   * @private
   */
  private calculatePayout(policy: PolicyDocument, trigger: TriggerDocument): any {
    const { coverageDetails } = policy;
    const basePayout = coverageDetails.maxPayout;
    const deductible = coverageDetails.deductible;
    
    // Simplified calculation - in reality would be much more sophisticated
    const netPayout = Math.max(0, basePayout - deductible);
    
    return {
      basePayout,
      deductible,
      adjustments: [],
      netPayout,
      currency: coverageDetails.currency
    };
  }

  /**
   * @method checkPoolLiquidity
   * @description Check risk pool liquidity for payout
   * 
   * Checks whether the risk pool has sufficient liquidity to cover the
   * payout amount.
   * 
   * @param payout - The payout document to check liquidity for
   * @returns Promise<any> - Liquidity check results
   * 
   * @private
   */
  private async checkPoolLiquidity(payout: PayoutDocument): Promise<any> {
    // Mock liquidity check - in reality would check actual pool balances
    const mockPoolLiquidity = 500000;
    const requiredAmount = payout.calculation.netPayout;
    
    return {
      poolLiquidity: mockPoolLiquidity,
      requiredAmount,
      hasLiquidity: mockPoolLiquidity >= requiredAmount,
      checkTimestamp: new Date()
    };
  }
}
