import { Injectable, Logger } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import { OnModuleInit } from '@nestjs/common';
import { PolicyFactoryService } from '../../policy-factory/service/policy-factory.service';
import { PoolEventsService } from '../../pool-events/service/pool-events.service';
import { TriggersService } from '../../triggers/service/triggers.service';
import { PayoutsService } from '../../payouts/service/payouts.service';
import { CessionService } from '../../cession/service/cession.service';
import { SmartNodeCommonService } from '../../smartnode-common.service';

interface FlowOptions {
  demo?: boolean;
  verbose?: boolean;
  policyId?: string;
  beneficiary?: string;
  amount?: number;
  premium?: number;
  retention?: number;
}

/**
 * @class FlowCommand
 * @description CLI command for running the complete parametric insurance flow
 * 
 * This command demonstrates the complete parametric insurance ecosystem flow:
 * 1. Policy creation and rule management
 * 2. Pool capital contribution
 * 3. Reinsurance treaty participation
 * 4. Farmer insurance contract
 * 5. Monthly premium payment (10k)
 * 6. Value distribution (70% Pool, 25% Reinsurers, 5% System)
 * 7. Climate catastrophe occurrence
 * 8. Oracle trigger event registration
 * 9. Payout execution with stop-loss (80k from pool)
 * 10. Reinsurer activation for remaining amount
 * 
 * The command supports both real execution and demo mode for testing.
 */
@Injectable()
@Command({ 
  name: 'flow', 
  description: 'Run the complete parametric insurance flow demonstration',
  options: {
    isDefault: false
  }
})
export class FlowCommand extends CommandRunner implements OnModuleInit {
  private readonly logger = new Logger(FlowCommand.name);

  constructor(
    private readonly policyFactory: PolicyFactoryService,
    private readonly poolEvents: PoolEventsService,
    private readonly triggers: TriggersService,
    private readonly payouts: PayoutsService,
    private readonly cession: CessionService,
    private readonly smartNode: SmartNodeCommonService,
  ) {
    super();
  }

  async onModuleInit() {
    this.logger.log('Flow command initialized');
  }

  @Option({
    flags: '-d, --demo',
    description: 'Run in demo mode (simulate flow without real API calls)',
    defaultValue: false,
  })
  parseDemo(val: string | boolean): boolean {
    if (typeof val === 'boolean') return val;
    return val === 'true' || val === '1' || val === '' || val === 'demo';
  }

  @Option({
    flags: '-v, --verbose',
    description: 'Enable verbose output',
    defaultValue: false,
  })
  parseVerbose(val: string): boolean {
    return val === 'true' || val === '1';
  }

  @Option({
    flags: '-p, --policy-id <policyId>',
    description: 'Custom policy ID (default: auto-generated)',
  })
  parsePolicyId(val: string): string {
    return val;
  }

  @Option({
    flags: '-b, --beneficiary <beneficiary>',
    description: 'Beneficiary account ID (default: test account)',
    defaultValue: '0.0.6801946',
  })
  parseBeneficiary(val: string): string {
    return val;
  }

  @Option({
    flags: '-a, --amount <amount>',
    description: 'Insurance amount (default: 100000)',
    defaultValue: 100000,
  })
  parseAmount(val: string): number {
    return parseInt(val, 10);
  }

  @Option({
    flags: '--premium <premium>',
    description: 'Premium amount (default: 10000)',
    defaultValue: 10000,
  })
  parsePremium(val: string): number {
    return parseInt(val, 10);
  }

  @Option({
    flags: '--retention <retention>',
    description: 'Retention amount (default: 80000)',
    defaultValue: 80000,
  })
  parseRetention(val: string): number {
    return parseInt(val, 10);
  }

  async run(passedParams: string[], options: FlowOptions): Promise<void> {
    try {
      this.logger.log('🚀 Starting Parametric Insurance Flow...');
      this.logger.debug(`Options: ${JSON.stringify(options)}`);
      this.logger.debug(`Passed params: ${JSON.stringify(passedParams)}`);

      // Check for demo flag in passed params as fallback
      const isDemo = options.demo || passedParams.includes('--demo') || passedParams.includes('-d') || passedParams.includes('demo');
      
      if (isDemo) {
        this.logger.log('🎭 Demo mode detected, running simulation...');
        await this.runDemoMode(options);
      } else {
        this.logger.log('🔄 Real mode detected, running actual flow...');
        await this.runRealFlow(options);
      }

      this.logger.log('✅ Flow completed successfully!');
    } catch (error) {
      this.logger.error('❌ Flow execution failed:', error);
      throw error;
    }
  }

  private async runDemoMode(options: FlowOptions): Promise<void> {
    this.logger.log('🎭 Running in DEMO mode...');
    
    const steps = [
      '1. Sistema gera seguros e suas regras',
      '2. Contribuidores travam capital no pool',
      '3. Resseguradores assinam tratado de participação',
      '4. Agricultor contrata o seguro',
      '5. Agricultor paga mensalmente 10k',
      '6. Distribuição: 70% Pool, 25% Resseguradores, 5% Sistema',
      '7. Agricultor sofre catástrofe climática',
      '8. Oracle registra triggerEvent',
      '9. Pool paga 80k (stop-loss)',
      '10. Resseguradores pagam 20k restante'
    ];

    for (const step of steps) {
      this.logger.log(`✅ ${step}`);
      await this.delay(1000); // Simulate processing time
    }

    this.logger.log('🎉 Demo flow completed!');
    this.showFlowSummary(options);
  }

  private async runRealFlow(options: FlowOptions): Promise<void> {
    this.logger.log('🔄 Running REAL flow...');

    const policyId = options.policyId || `pol_${Date.now()}`;
    const beneficiary = options.beneficiary || '0.0.6801946';
    const amount = options.amount || 100000;
    const premium = options.premium || 10000;
    const retention = options.retention || 80000;

    // Step 1: Create Policy
    this.logger.log('📋 Step 1: Creating insurance policy...');
    await this.createPolicy(policyId, beneficiary, amount, premium, retention);
    await this.delay(3000); // Wait for policy processing

    // Step 2: Pool Deposit
    this.logger.log('💰 Step 2: Making pool deposit...');
    await this.makePoolDeposit();
    await this.delay(2000); // Wait for pool deposit processing

    // Step 3: Pay Premium
    this.logger.log('💳 Step 3: Paying premium...');
    await this.payPremium(policyId, premium);
    await this.delay(2000); // Wait for premium processing

    // Step 4: Trigger Weather Event
    this.logger.log('🌡️ Step 4: Triggering weather event...');
    await this.triggerWeatherEvent(policyId);
    await this.delay(2000); // Wait for trigger processing

    // Step 5: Execute Payout (Pool)
    this.logger.log('💸 Step 5: Executing pool payout...');
    await this.executePayout(policyId, beneficiary, retention);
    await this.delay(3000); // Wait for payout processing

    // Step 6: Request Cession
    this.logger.log('🤝 Step 6: Requesting cession...');
    await this.requestCession(policyId, amount - retention);
    await this.delay(2000); // Wait for cession request processing

    // Step 7: Fund Cession
    this.logger.log('💵 Step 7: Funding cession...');
    await this.fundCession(policyId, amount - retention);
    await this.delay(2000); // Wait for cession funding processing

    // Step 8: Execute Final Payout
    this.logger.log('🎯 Step 8: Executing final payout...');
    await this.executeFinalPayout(policyId, beneficiary, amount - retention);
    await this.delay(3000); // Wait for final payout processing

    this.showFlowSummary(options);
  }

  private async createPolicy(
    policyId: string, 
    beneficiary: string, 
    amount: number, 
    premium: number, 
    retention: number
  ): Promise<void> {
    const policyData = {
      policyId,
      beneficiary,
      location: 'São Paulo, Brazil',
      sumInsured: amount,
      premium,
      retention,
      validity: {
        from: new Date().toISOString(),
        to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      ruleRef: {
        topicId: '0.0.123456',
        ts: Date.now().toString()
      }
    };

    try {
      const result = await this.policyFactory.createPolicy(policyData);
      this.logger.log(`✅ Policy created: ${policyId}`);
      this.logger.debug('Policy creation result:', result);
    } catch (error) {
      this.logger.error('Failed to create policy:', error);
      throw error;
    }
  }

  private async makePoolDeposit(): Promise<void> {
    const depositData = {
      poolId: 'pool_1',
      amount: 500000,
      currencyTokenId: '0.0.STABLESIM',
      ref: `deposit_${Date.now()}`
    };

    try {
      await this.poolEvents.enqueueDeposit(depositData);
      this.logger.log('✅ Pool deposit queued: 500,000 tokens');
    } catch (error) {
      this.logger.error('Failed to make pool deposit:', error);
      throw error;
    }
  }

  private async payPremium(policyId: string, premium: number): Promise<void> {
    const premiumData = {
      poolId: 'pool_1',
      policyId,
      amount: premium,
      currencyTokenId: '0.0.STABLESIM',
      ref: `premium_${Date.now()}`
    };

    try {
      await this.poolEvents.enqueuePremium(premiumData);
      this.logger.log(`✅ Premium payment queued: ${premium} tokens`);
    } catch (error) {
      this.logger.error('Failed to pay premium:', error);
      throw error;
    }
  }

  private async triggerWeatherEvent(policyId: string): Promise<void> {
    const triggerData = {
      type: 'weather',
      policyId,
      location: 'São Paulo, Brazil',
      index: {
        temperature: 36.5,
        threshold: 35.0
      },
      window: {
        from: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString()
      },
      ruleRef: {
        topicId: '0.0.123456',
        ts: Date.now().toString()
      },
      oracleSig: `oracle_signature_${Date.now()}`,
      smartNodeSig: `smartnode_signature_${Date.now()}`
    };

    try {
      await this.triggers.enqueueTriggerEvent(triggerData);
      this.logger.log('✅ Weather event triggered: Temperature > 35°C');
    } catch (error) {
      this.logger.error('Failed to trigger weather event:', error);
      throw error;
    }
  }

  private async executePayout(policyId: string, beneficiary: string, amount: number): Promise<void> {
    const payoutData = {
      policyId,
      beneficiary,
      amount,
      source: 'POOL' as const,
      triggerRef: {
        topicId: '0.0.123456',
        ts: Date.now().toString()
      },
      ruleRef: {
        topicId: '0.0.123456',
        ts: Date.now().toString()
      },
      sourceRef: {
        topicId: '0.0.123456',
        ts: Date.now().toString()
      },
      statusRef: {
        topicId: '0.0.123456',
        ts: Date.now().toString()
      },
      txId: `tx_${Date.now()}`
    };

    try {
      await this.payouts.enqueueExecuted(payoutData);
      this.logger.log(`✅ Pool payout queued: ${amount} tokens`);
    } catch (error) {
      this.logger.error('Failed to execute payout:', error);
      throw error;
    }
  }

  private async requestCession(policyId: string, excessAmount: number): Promise<void> {
    const cessionData = {
      policyId,
      excessAmount,
      triggerRef: {
        topicId: '0.0.123456',
        ts: Date.now().toString()
      },
      ruleRef: {
        topicId: '0.0.123456',
        ts: Date.now().toString()
      },
      lossCum: 100000,
      retention: 80000
    };

    try {
      await this.cession.enqueueRequested(cessionData);
      this.logger.log(`✅ Cession request queued: ${excessAmount} tokens excess`);
    } catch (error) {
      this.logger.error('Failed to request cession:', error);
      throw error;
    }
  }

  private async fundCession(policyId: string, amount: number): Promise<void> {
    const fundingData = {
      policyId,
      amount,
      reinsurer: '0.0.6801949',
      txId: `tx_${Date.now()}`,
      ruleRef: {
        topicId: '0.0.123456',
        ts: Date.now().toString()
      },
      cessionRef: `cession_${Date.now()}`
    };

    try {
      await this.cession.enqueueFunded(fundingData);
      this.logger.log(`✅ Cession funding queued: ${amount} tokens from reinsurer`);
    } catch (error) {
      this.logger.error('Failed to fund cession:', error);
      throw error;
    }
  }

  private async executeFinalPayout(policyId: string, beneficiary: string, amount: number): Promise<void> {
    const finalPayoutData = {
      policyId,
      beneficiary,
      amount,
      source: 'CESSION' as const,
      triggerRef: {
        topicId: '0.0.123456',
        ts: Date.now().toString()
      },
      ruleRef: {
        topicId: '0.0.123456',
        ts: Date.now().toString()
      },
      sourceRef: {
        topicId: '0.0.123456',
        ts: Date.now().toString()
      },
      statusRef: {
        topicId: '0.0.123456',
        ts: Date.now().toString()
      },
      txId: `tx_${Date.now()}`
    };

    try {
      await this.payouts.enqueueExecuted(finalPayoutData);
      this.logger.log(`✅ Final payout queued: ${amount} tokens from cession`);
    } catch (error) {
      this.logger.error('Failed to execute final payout:', error);
      throw error;
    }
  }

  private showFlowSummary(options: FlowOptions): void {
    this.logger.log('\n🎉 Parametric Insurance Flow Summary:');
    this.logger.log('=====================================');
    this.logger.log('📋 Policy Created: ✅');
    this.logger.log('💰 Pool Deposit: 500,000 tokens ✅');
    this.logger.log('💳 Premium Paid: 10,000 tokens ✅');
    this.logger.log('🌡️  Weather Event: Temperature > 35°C ✅');
    this.logger.log('💸 Pool Payout: 80,000 tokens (stop-loss) ✅');
    this.logger.log('🤝 Cession Request: 20,000 tokens excess ✅');
    this.logger.log('💵 Cession Funding: 20,000 tokens from reinsurer ✅');
    this.logger.log('🎯 Final Payout: 20,000 tokens from cession ✅');
    this.logger.log('\n💰 Total Payout: 100,000 tokens');
    this.logger.log('   - Pool Contribution: 80,000 tokens (80%)');
    this.logger.log('   - Reinsurer Contribution: 20,000 tokens (20%)');
    this.logger.log('\n💳 Premium Distribution (10,000 tokens):');
    this.logger.log('   - Pool Reserve: 7,000 tokens (70%)');
    this.logger.log('   - Reinsurer: 2,500 tokens (25%)');
    this.logger.log('   - System Fee: 500 tokens (5%)');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
