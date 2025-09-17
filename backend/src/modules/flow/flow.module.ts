import { Module } from '@nestjs/common';
import { FlowCommand } from './cli/flow-cli';
import { PolicyFactoryModule } from '../policy-factory/policy-factory.module';
import { PoolEventsModule } from '../pool-events/pool-events.module';
import { TriggersModule } from '../triggers/triggers.module';
import { PayoutsModule } from '../payouts/payouts.module';
import { CessionModule } from '../cession/cession.module';
import { SmartNodeCommonModule } from '../smartnode-common.module';

/**
 * @module FlowModule
 * @description Module for parametric insurance flow execution
 * 
 * This module provides comprehensive flow execution capabilities for the
 * parametric insurance ecosystem, including:
 * - Complete flow demonstration (demo and real modes)
 * - Policy creation and management
 * - Pool operations and capital management
 * - Trigger event processing
 * - Payout execution with stop-loss logic
 * - Reinsurance cession handling
 * 
 * The module integrates all necessary services to execute the complete
 * parametric insurance flow from policy creation to final payout.
 */
@Module({
  imports: [
    PolicyFactoryModule,
    PoolEventsModule,
    TriggersModule,
    PayoutsModule,
    CessionModule,
    SmartNodeCommonModule,
  ],
  providers: [FlowCommand],
  exports: [FlowCommand],
})
export class FlowModule {}
