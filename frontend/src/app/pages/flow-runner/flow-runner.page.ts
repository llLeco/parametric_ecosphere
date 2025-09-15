import { Component } from '@angular/core';
import { CommonModule, KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../../components/components.module';
import { FlowRunnerService, StepResult } from '../../services/flow-runner.service';
import { ContextStore } from '../../store/context.store';

@Component({
  selector: 'app-flow-runner',
  standalone: true,
  imports: [CommonModule, IonicModule, ComponentsModule, NgIf, NgFor, KeyValuePipe],
  templateUrl: './flow-runner.page.html',
  styleUrls: ['./flow-runner.page.scss']
})
export class FlowRunnerPage {
  runningAll = false;
  results: Record<string, StepResult | undefined> = {};

  constructor(public flow: FlowRunnerService, public ctx: ContextStore) {}

  async run(name: string, fn: () => Promise<StepResult>, body?: any) {
    this.results[name] = undefined;
    const res = await fn.call(this.flow, body);
    this.results[name] = res;
  }

  async runAll() {
    this.runningAll = true;
    await this.flow.runAll((name, res) => this.results[name] = res, true);
    this.runningAll = false;
  }

  get ruleTemplate(): string {
    const payload = {
      ruleId: 'rule_rainfall_hex_001',
      indexDef: { metric: 'rain_30d_mm', operator: '<', threshold: 50, windowDays: 21 },
      payout: { amount: 100000, currencyTokenId: '0.0.STABLESIM' },
      validity: { from: '2025-09-01T00:00:00Z', to: '2026-08-31T23:59:59Z' }
    };
    return JSON.stringify(payload, null, 2);
  }

  get policyTemplate(): string {
    const payload = {
      policyId: 'pol_001',
      beneficiary: this.ctx.snapshot.wallets.beneficiary,
      location: 'hex_lat19.9_lng43.9',
      sumInsured: 100000,
      premium: 10000,
      retention: 80000,
      validity: { from: '2025-09-01', to: '2026-08-31' },
      ruleRef: { topicId: '<TOPIC_RULES>', ts: this.ctx.snapshot.rule?.ruleRef?.ts || '<RULE_TS>' }
    };
    return JSON.stringify(payload, null, 2);
  }

  get premiumTemplate(): string {
    const payload = {
      poolId: 'pool_1',
      policyId: this.ctx.snapshot.policy?.policyId || 'pol_001',
      from: this.ctx.snapshot.wallets.beneficiary,
      amount: 10000,
      currencyTokenId: '0.0.STABLESIM'
    } as any;
    return JSON.stringify(payload, null, 2);
  }

  get triggerTemplate(): string {
    const payload = {
      policyId: this.ctx.snapshot.policy?.policyId || 'pol_001',
      location: 'hex_lat19.9_lng43.9',
      index: { rain_30d_mm: 12.4 },
      window: { from: '2025-08-01', to: '2025-08-21' },
      ruleRef: { topicId: '<TOPIC_RULES>', ts: this.ctx.snapshot.rule?.ruleRef?.ts || '<RULE_TS>' },
      oracleSig: 'MOCK_SIGNATURE'
    };
    return JSON.stringify(payload, null, 2);
  }

  get payoutTemplate(): string {
    const payload = {
      policyId: this.ctx.snapshot.policy?.policyId || 'pol_001',
      beneficiary: this.ctx.snapshot.wallets.beneficiary,
      amount: 100000,
      source: 'POOL',
      triggerRef: { topicId: '<TOPIC_TRIGGERS>', ts: this.ctx.snapshot.trigger?.ts || '<TRIGGER_TS>' },
      ruleRef: { topicId: '<TOPIC_RULES>', ts: this.ctx.snapshot.rule?.ruleRef?.ts || '<RULE_TS>' },
      statusRef: { topicId: this.ctx.snapshot.policy?.statusTopicId || '<STATUS_TOPIC_ID>', ts: this.ctx.snapshot.policy?.statusInitTs || '<STATUS_INIT_TS>' },
      txId: '0.0.5173509@mock'
    };
    return JSON.stringify(payload, null, 2);
  }
}


