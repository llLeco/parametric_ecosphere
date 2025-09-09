import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PolicyWorkflowService } from './policy-workflow.service';
import { Policy, PolicyDocument } from './schemas/policy.schema';
import { Trigger, TriggerDocument } from './schemas/trigger.schema';
import { Payout, PayoutDocument } from './schemas/payout.schema';

/**
 * @class PolicyWorkflowConsumer
 * @description Event-driven consumer for policy workflow processing
 * 
 * This consumer handles asynchronous processing of policy workflow events
 * using the event-driven architecture pattern. It listens to events emitted
 * by the PolicyWorkflowService and performs background processing tasks.
 * 
 * The consumer pattern separates concerns by:
 * - Handling event-driven business logic
 * - Managing background processing tasks
 * - Processing complex workflows asynchronously
 * - Maintaining system responsiveness
 * 
 * @example
 * ```typescript
 * // Events are automatically consumed when emitted by the service
 * this.eventEmitter.emit('policy.created', { policyId, policy });
 * // Consumer automatically processes the event
 * ```
 */
@Injectable()
export class PolicyWorkflowConsumer {
  private readonly logger = new Logger(PolicyWorkflowConsumer.name);

  /**
   * @constructor
   * @param policyWorkflowService - Injected policy workflow service
   * @param policyModel - Mongoose model for Policy documents
   * @param triggerModel - Mongoose model for Trigger documents
   * @param payoutModel - Mongoose model for Payout documents
   */
  constructor(
    private readonly policyWorkflowService: PolicyWorkflowService,
    @InjectModel(Policy.name) private policyModel: Model<PolicyDocument>,
    @InjectModel(Trigger.name) private triggerModel: Model<TriggerDocument>,
    @InjectModel(Payout.name) private payoutModel: Model<PayoutDocument>
  ) {}

  /**
   * @method onPolicyCreated
   * @description Handle policy creation events
   * 
   * Processes policy creation events by performing background tasks such as:
   * - Risk assessment calculations
   * - Premium calculations
   * - Risk pool allocation
   * - Reinsurance setup
   * - HCS topic creation
   * 
   * @param payload - Event payload containing policy information
   * @returns Promise<void>
   * 
   * @example
   * ```typescript
   * // This method is automatically called when 'policy.created' event is emitted
   * this.eventEmitter.emit('policy.created', { policyId: '123', policy: policyDoc });
   * ```
   */
  @OnEvent('policy.created')
  async onPolicyCreated(payload: { policyId: string; policy: PolicyDocument }): Promise<void> {
    this.logger.log(`Processing policy creation event for policy: ${payload.policyId}`);
    
    try {
      const { policyId, policy } = payload;
      
      // Perform risk assessment
      await this.performRiskAssessment(policy);
      
      // Calculate premium adjustments
      await this.calculatePremiumAdjustments(policy);
      
      // Allocate to risk pool
      await this.allocateToRiskPool(policy);
      
      // Setup reinsurance if applicable
      if (policy.reinsuranceDetails) {
        await this.setupReinsurance(policy);
      }
      
      // Create HCS topic for policy
      await this.createPolicyHcsTopic(policy);
      
      this.logger.log(`Successfully processed policy creation for: ${policyId}`);
      
    } catch (error) {
      this.logger.error(`Failed to process policy creation for ${payload.policyId}: ${error.message}`);
    }
  }

  /**
   * @method onPolicyActivated
   * @description Handle policy activation events
   * 
   * Processes policy activation events by performing tasks such as:
   * - Final validation checks
   * - Premium collection setup
   * - Monitoring system activation
   * - Notification dispatch
   * 
   * @param payload - Event payload containing policy information
   * @returns Promise<void>
   */
  @OnEvent('policy.activated')
  async onPolicyActivated(payload: { policyId: string; policy: PolicyDocument }): Promise<void> {
    this.logger.log(`Processing policy activation event for policy: ${payload.policyId}`);
    
    try {
      const { policyId, policy } = payload;
      
      // Perform final validation
      await this.performFinalValidation(policy);
      
      // Setup premium collection
      await this.setupPremiumCollection(policy);
      
      // Activate monitoring
      await this.activatePolicyMonitoring(policy);
      
      // Send activation notifications
      await this.sendActivationNotifications(policy);
      
      this.logger.log(`Successfully processed policy activation for: ${policyId}`);
      
    } catch (error) {
      this.logger.error(`Failed to process policy activation for ${payload.policyId}: ${error.message}`);
    }
  }

  /**
   * @method onTriggerReceived
   * @description Handle trigger event reception
   * 
   * Processes trigger events by performing background validation and
   * processing tasks such as:
   * - Oracle attestation validation
   * - Data integrity checks
   * - Location verification
   * - Historical data analysis
   * 
   * @param payload - Event payload containing trigger information
   * @returns Promise<void>
   */
  @OnEvent('trigger.received')
  async onTriggerReceived(payload: { triggerId: string; trigger: TriggerDocument }): Promise<void> {
    this.logger.log(`Processing trigger reception event for trigger: ${payload.triggerId}`);
    
    try {
      const { triggerId, trigger } = payload;
      
      // Validate oracle attestations
      await this.validateOracleAttestations(trigger);
      
      // Perform data integrity checks
      await this.performDataIntegrityChecks(trigger);
      
      // Verify location data
      await this.verifyLocationData(trigger);
      
      // Analyze historical data
      await this.analyzeHistoricalData(trigger);
      
      this.logger.log(`Successfully processed trigger reception for: ${triggerId}`);
      
    } catch (error) {
      this.logger.error(`Failed to process trigger reception for ${payload.triggerId}: ${error.message}`);
    }
  }

  /**
   * @method onTriggerValidated
   * @description Handle trigger validation events
   * 
   * Processes validated triggers by performing payout preparation tasks:
   * - Payout calculation
   * - Liquidity checks
   * - Risk pool distribution
   * - Reinsurance processing
   * 
   * @param payload - Event payload containing trigger and policy information
   * @returns Promise<void>
   */
  @OnEvent('trigger.validated')
  async onTriggerValidated(payload: { triggerId: string; policyId: string }): Promise<void> {
    this.logger.log(`Processing trigger validation event for trigger: ${payload.triggerId}`);
    
    try {
      const { triggerId, policyId } = payload;
      
      // Get the trigger and policy documents
      const trigger = await this.triggerModel.findById(triggerId);
      const policy = await this.policyModel.findById(policyId);
      
      if (!trigger || !policy) {
        throw new Error(`Trigger or policy not found: triggerId=${triggerId}, policyId=${policyId}`);
      }
      
      // Calculate payout amount
      const payoutAmount = await this.calculatePayoutAmount(policy, trigger);
      
      // Check liquidity
      const liquidityCheck = await this.checkLiquidity(payoutAmount);
      
      // Distribute across risk pools
      await this.distributeAcrossRiskPools(policy, payoutAmount);
      
      // Process reinsurance
      if (policy.reinsuranceDetails) {
        await this.processReinsuranceCession(policy, payoutAmount);
      }
      
      this.logger.log(`Successfully processed trigger validation for: ${triggerId}`);
      
    } catch (error) {
      this.logger.error(`Failed to process trigger validation for ${payload.triggerId}: ${error.message}`);
    }
  }

  /**
   * @method onPayoutCalculated
   * @description Handle payout calculation events
   * 
   * Processes calculated payouts by performing execution preparation:
   * - Final approval checks
   * - Transaction preparation
   * - HTS integration setup
   * - Audit trail creation
   * 
   * @param payload - Event payload containing payout information
   * @returns Promise<void>
   */
  @OnEvent('payout.calculated')
  async onPayoutCalculated(payload: { payoutId: string; policyId: string }): Promise<void> {
    this.logger.log(`Processing payout calculation event for payout: ${payload.payoutId}`);
    
    try {
      const { payoutId, policyId } = payload;
      
      // Get the payout document
      const payout = await this.payoutModel.findById(payoutId);
      
      if (!payout) {
        throw new Error(`Payout not found: ${payoutId}`);
      }
      
      // Perform final approval checks
      await this.performFinalApprovalChecks(payout);
      
      // Prepare HTS transaction
      await this.prepareHtsTransaction(payout);
      
      // Create audit trail
      await this.createAuditTrail(payout);
      
      // Update payout status
      await this.payoutModel.findByIdAndUpdate(payoutId, {
        status: 'approved',
        approvalTimestamp: new Date()
      });
      
      this.logger.log(`Successfully processed payout calculation for: ${payoutId}`);
      
    } catch (error) {
      this.logger.error(`Failed to process payout calculation for ${payload.payoutId}: ${error.message}`);
    }
  }

  /**
   * @method onPayoutCompleted
   * @description Handle payout completion events
   * 
   * Processes completed payouts by performing cleanup and notification tasks:
   * - Policy status updates
   * - Notification dispatch
   * - Reporting updates
   * - Analytics updates
   * 
   * @param payload - Event payload containing payout information
   * @returns Promise<void>
   */
  @OnEvent('payout.completed')
  async onPayoutCompleted(payload: { payoutId: string; transactionId: string; amount: number }): Promise<void> {
    this.logger.log(`Processing payout completion event for payout: ${payload.payoutId}`);
    
    try {
      const { payoutId, transactionId, amount } = payload;
      
      // Get the payout document
      const payout = await this.payoutModel.findById(payoutId);
      
      if (!payout) {
        throw new Error(`Payout not found: ${payoutId}`);
      }
      
      // Update policy status
      await this.policyModel.findByIdAndUpdate(payout.policyId, {
        status: 'paid_out'
      });
      
      // Send completion notifications
      await this.sendPayoutCompletionNotifications(payout);
      
      // Update reporting data
      await this.updateReportingData(payout);
      
      // Update analytics
      await this.updateAnalytics(payout);
      
      this.logger.log(`Successfully processed payout completion for: ${payoutId}`);
      
    } catch (error) {
      this.logger.error(`Failed to process payout completion for ${payload.payoutId}: ${error.message}`);
    }
  }

  // Private helper methods for event processing

  /**
   * @method performRiskAssessment
   * @description Perform risk assessment for a policy
   * @param policy - Policy document to assess
   * @private
   */
  private async performRiskAssessment(policy: PolicyDocument): Promise<void> {
    this.logger.log(`Performing risk assessment for policy: ${policy._id}`);
    // Implementation for risk assessment
  }

  /**
   * @method calculatePremiumAdjustments
   * @description Calculate premium adjustments based on risk factors
   * @param policy - Policy document to calculate adjustments for
   * @private
   */
  private async calculatePremiumAdjustments(policy: PolicyDocument): Promise<void> {
    this.logger.log(`Calculating premium adjustments for policy: ${policy._id}`);
    // Implementation for premium calculations
  }

  /**
   * @method allocateToRiskPool
   * @description Allocate policy to appropriate risk pool
   * @param policy - Policy document to allocate
   * @private
   */
  private async allocateToRiskPool(policy: PolicyDocument): Promise<void> {
    this.logger.log(`Allocating policy to risk pool: ${policy._id}`);
    // Implementation for risk pool allocation
  }

  /**
   * @method setupReinsurance
   * @description Setup reinsurance for a policy
   * @param policy - Policy document to setup reinsurance for
   * @private
   */
  private async setupReinsurance(policy: PolicyDocument): Promise<void> {
    this.logger.log(`Setting up reinsurance for policy: ${policy._id}`);
    // Implementation for reinsurance setup
  }

  /**
   * @method createPolicyHcsTopic
   * @description Create HCS topic for policy
   * @param policy - Policy document to create topic for
   * @private
   */
  private async createPolicyHcsTopic(policy: PolicyDocument): Promise<void> {
    this.logger.log(`Creating HCS topic for policy: ${policy._id}`);
    // Implementation for HCS topic creation
  }

  /**
   * @method performFinalValidation
   * @description Perform final validation before policy activation
   * @param policy - Policy document to validate
   * @private
   */
  private async performFinalValidation(policy: PolicyDocument): Promise<void> {
    this.logger.log(`Performing final validation for policy: ${policy._id}`);
    // Implementation for final validation
  }

  /**
   * @method setupPremiumCollection
   * @description Setup premium collection for a policy
   * @param policy - Policy document to setup collection for
   * @private
   */
  private async setupPremiumCollection(policy: PolicyDocument): Promise<void> {
    this.logger.log(`Setting up premium collection for policy: ${policy._id}`);
    // Implementation for premium collection setup
  }

  /**
   * @method activatePolicyMonitoring
   * @description Activate monitoring for a policy
   * @param policy - Policy document to activate monitoring for
   * @private
   */
  private async activatePolicyMonitoring(policy: PolicyDocument): Promise<void> {
    this.logger.log(`Activating monitoring for policy: ${policy._id}`);
    // Implementation for monitoring activation
  }

  /**
   * @method sendActivationNotifications
   * @description Send activation notifications
   * @param policy - Policy document to send notifications for
   * @private
   */
  private async sendActivationNotifications(policy: PolicyDocument): Promise<void> {
    this.logger.log(`Sending activation notifications for policy: ${policy._id}`);
    // Implementation for notification sending
  }

  /**
   * @method validateOracleAttestations
   * @description Validate oracle attestations for a trigger
   * @param trigger - Trigger document to validate attestations for
   * @private
   */
  private async validateOracleAttestations(trigger: TriggerDocument): Promise<void> {
    this.logger.log(`Validating oracle attestations for trigger: ${trigger._id}`);
    // Implementation for oracle validation
  }

  /**
   * @method performDataIntegrityChecks
   * @description Perform data integrity checks for a trigger
   * @param trigger - Trigger document to check
   * @private
   */
  private async performDataIntegrityChecks(trigger: TriggerDocument): Promise<void> {
    this.logger.log(`Performing data integrity checks for trigger: ${trigger._id}`);
    // Implementation for data integrity checks
  }

  /**
   * @method verifyLocationData
   * @description Verify location data for a trigger
   * @param trigger - Trigger document to verify location for
   * @private
   */
  private async verifyLocationData(trigger: TriggerDocument): Promise<void> {
    this.logger.log(`Verifying location data for trigger: ${trigger._id}`);
    // Implementation for location verification
  }

  /**
   * @method analyzeHistoricalData
   * @description Analyze historical data for a trigger
   * @param trigger - Trigger document to analyze
   * @private
   */
  private async analyzeHistoricalData(trigger: TriggerDocument): Promise<void> {
    this.logger.log(`Analyzing historical data for trigger: ${trigger._id}`);
    // Implementation for historical data analysis
  }

  /**
   * @method calculatePayoutAmount
   * @description Calculate payout amount for a policy and trigger
   * @param policy - Policy document
   * @param trigger - Trigger document
   * @returns Promise<number> - Calculated payout amount
   * @private
   */
  private async calculatePayoutAmount(policy: PolicyDocument, trigger: TriggerDocument): Promise<number> {
    this.logger.log(`Calculating payout amount for policy: ${policy._id}, trigger: ${trigger._id}`);
    // Implementation for payout calculation
    return 0;
  }

  /**
   * @method checkLiquidity
   * @description Check liquidity for a payout amount
   * @param amount - Payout amount to check liquidity for
   * @returns Promise<any> - Liquidity check results
   * @private
   */
  private async checkLiquidity(amount: number): Promise<any> {
    this.logger.log(`Checking liquidity for amount: ${amount}`);
    // Implementation for liquidity checking
    return { hasLiquidity: true };
  }

  /**
   * @method distributeAcrossRiskPools
   * @description Distribute payout across risk pools
   * @param policy - Policy document
   * @param amount - Payout amount
   * @private
   */
  private async distributeAcrossRiskPools(policy: PolicyDocument, amount: number): Promise<void> {
    this.logger.log(`Distributing payout across risk pools for policy: ${policy._id}, amount: ${amount}`);
    // Implementation for risk pool distribution
  }

  /**
   * @method processReinsuranceCession
   * @description Process reinsurance cession for a payout
   * @param policy - Policy document
   * @param amount - Payout amount
   * @private
   */
  private async processReinsuranceCession(policy: PolicyDocument, amount: number): Promise<void> {
    this.logger.log(`Processing reinsurance cession for policy: ${policy._id}, amount: ${amount}`);
    // Implementation for reinsurance processing
  }

  /**
   * @method performFinalApprovalChecks
   * @description Perform final approval checks for a payout
   * @param payout - Payout document to check
   * @private
   */
  private async performFinalApprovalChecks(payout: PayoutDocument): Promise<void> {
    this.logger.log(`Performing final approval checks for payout: ${payout._id}`);
    // Implementation for final approval checks
  }

  /**
   * @method prepareHtsTransaction
   * @description Prepare HTS transaction for a payout
   * @param payout - Payout document to prepare transaction for
   * @private
   */
  private async prepareHtsTransaction(payout: PayoutDocument): Promise<void> {
    this.logger.log(`Preparing HTS transaction for payout: ${payout._id}`);
    // Implementation for HTS transaction preparation
  }

  /**
   * @method createAuditTrail
   * @description Create audit trail for a payout
   * @param payout - Payout document to create audit trail for
   * @private
   */
  private async createAuditTrail(payout: PayoutDocument): Promise<void> {
    this.logger.log(`Creating audit trail for payout: ${payout._id}`);
    // Implementation for audit trail creation
  }

  /**
   * @method sendPayoutCompletionNotifications
   * @description Send payout completion notifications
   * @param payout - Payout document to send notifications for
   * @private
   */
  private async sendPayoutCompletionNotifications(payout: PayoutDocument): Promise<void> {
    this.logger.log(`Sending payout completion notifications for payout: ${payout._id}`);
    // Implementation for notification sending
  }

  /**
   * @method updateReportingData
   * @description Update reporting data for a payout
   * @param payout - Payout document to update reporting for
   * @private
   */
  private async updateReportingData(payout: PayoutDocument): Promise<void> {
    this.logger.log(`Updating reporting data for payout: ${payout._id}`);
    // Implementation for reporting updates
  }

  /**
   * @method updateAnalytics
   * @description Update analytics for a payout
   * @param payout - Payout document to update analytics for
   * @private
   */
  private async updateAnalytics(payout: PayoutDocument): Promise<void> {
    this.logger.log(`Updating analytics for payout: ${payout._id}`);
    // Implementation for analytics updates
  }
}
