import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PolicyWorkflowService } from './policy-workflow.service';
import { PolicyWorkflowController } from './policy-workflow.controller';
import { PolicyWorkflowConsumer } from './policy-workflow.consumer';
import { Policy, PolicySchema } from './schemas/policy.schema';
import { Trigger, TriggerSchema } from './schemas/trigger.schema';
import { Payout, PayoutSchema } from './schemas/payout.schema';

/**
 * @class PolicyWorkflowModule
 * @description Central Policy Workflow Engine for parametric insurance operations
 * 
 * This module orchestrates the entire parametric insurance lifecycle:
 * - Policy creation and management
 * - Trigger event processing from oracles
 * - Automated payout calculations and execution
 * - Risk assessment and premium calculations
 * - Integration with Hedera services (HCS, HTS, HFS)
 * 
 * The module follows a controller-service-consumer architecture pattern:
 * - Controller: Handles HTTP requests and API endpoints
 * - Service: Contains core business logic and data operations
 * - Consumer: Processes events asynchronously for background tasks
 * 
 * The module provides a complete workflow management system that handles
 * the end-to-end process from policy creation through automated payouts,
 * including regulatory compliance checks and reinsurance processing.
 * 
 * @example
 * ```typescript
 * // Import the module in your app module
 * @Module({
 *   imports: [PolicyWorkflowModule],
 * })
 * export class AppModule {}
 * ```
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Policy.name, schema: PolicySchema },
      { name: Trigger.name, schema: TriggerSchema },
      { name: Payout.name, schema: PayoutSchema }
    ])
  ],
  controllers: [PolicyWorkflowController],
  providers: [PolicyWorkflowService, PolicyWorkflowConsumer],
  exports: [PolicyWorkflowService]
})
export class PolicyWorkflowModule {}
