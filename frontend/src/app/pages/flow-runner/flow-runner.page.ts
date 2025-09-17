import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../../components/components.module';
import { FlowRunnerService, StepResult } from '../../services/flow-runner.service';
import { ContextStore } from '../../store/context.store';

@Component({
  selector: 'app-flow-runner',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, ComponentsModule],
  templateUrl: './flow-runner.page.html',
  styleUrls: ['./flow-runner.page.scss']
})
export class FlowRunnerPage {
  runningStep: string | null = null;
  results: Record<string, StepResult | undefined> = {};

  constructor(public readonly flow: FlowRunnerService, public readonly ctx: ContextStore) {}

  get createRuleTemplate(): string {
    const body = {
      ruleId: 'rule_rainfall_hex_001',
      indexDef: { metric: 'rain_30d_mm', operator: '<', threshold: 50, windowDays: 21 },
      payout: { amount: 100000, currencyTokenId: '0.0.STABLESIM' },
      validity: { from: '2025-09-01T00:00:00Z', to: '2026-08-31T23:59:59Z' }
    };
    return JSON.stringify(body, null, 2);
  }

  get createPolicyTemplate(): string {
    const snapshot = this.ctx.snapshot;
    const body = {
      policyId: snapshot.policy?.policyId || 'pol_001',
      beneficiary: snapshot.wallets.beneficiary,
      location: 'hex_lat19.9_lng43.9',
      sumInsured: 100000,
      premium: 10000,
      retention: 80000,
      validity: { from: '2025-09-01', to: '2026-08-31' },
      ruleRef: { topicId: '<TOPIC_RULES>', ts: snapshot.rule?.ruleRef?.ts || '<RULE_TS>' }
    };
    return JSON.stringify(body, null, 2);
  }

  get premiumToPoolTemplate(): string {
    const snapshot = this.ctx.snapshot;
    const body = {
      poolId: 'pool_1',
      policyId: snapshot.policy?.policyId || 'pol_001',
      from: snapshot.wallets.beneficiary,
      amount: 10000,
      currencyTokenId: '0.0.STABLESIM'
    };
    return JSON.stringify(body, null, 2);
  }

  get triggerTemplate(): string {
    const snapshot = this.ctx.snapshot;
    const body = {
      policyId: snapshot.policy?.policyId || 'pol_001',
      location: 'hex_lat19.9_lng43.9',
      index: { rain_30d_mm: 12.4 },
      window: { from: '2025-08-01', to: '2025-08-21' },
      ruleRef: { topicId: '<TOPIC_RULES>', ts: snapshot.rule?.ruleRef?.ts || '<RULE_TS>' },
      oracleSig: 'MOCK_SIGNATURE'
    };
    return JSON.stringify(body, null, 2);
  }

  get payoutTemplate(): string {
    const snapshot = this.ctx.snapshot;
    const body = {
      policyId: snapshot.policy?.policyId || 'pol_001',
      beneficiary: snapshot.wallets.beneficiary,
      amount: 100000,
      source: 'POOL',
      triggerRef: { topicId: '<TOPIC_TRIGGERS>', ts: snapshot.trigger?.ts || '<TRIGGER_TS>' },
      ruleRef: { topicId: '<TOPIC_RULES>', ts: snapshot.rule?.ruleRef?.ts || '<RULE_TS>' },
      statusRef: { topicId: snapshot.policy?.statusTopicId || '<STATUS_TOPIC_ID>', ts: snapshot.policy?.statusInitTs || '<STATUS_INIT_TS>' },
      txId: '0.0.5173509@mock'
    };
    return JSON.stringify(body, null, 2);
  }

  async runOne(name: string, exec: () => Promise<StepResult>) {
    this.runningStep = name;
    const res = await exec();
    this.results[name] = res;
    this.runningStep = null;
  }

  async runAll() {
    this.runningStep = 'ALL';
    await this.flow.runAll((name, res) => { this.results[name] = res; }, true);
    this.runningStep = null;
  }

  onCreateRule(payload?: any) {
    this.runOne('Create Rule', () => this.flow.createRule(payload));
  }

  onCreatePolicy(payload?: any) {
    this.runOne('Create Policy', () => this.flow.createPolicy(payload));
  }

  onPremiumToPool(payload?: any) {
    this.runOne('Premium to Pool', () => this.flow.poolPremium(payload));
  }

  onTriggerEvent(payload?: any) {
    this.runOne('Trigger Event', () => this.flow.triggerEvent(payload));
  }

  onExecutePayout(payload?: any) {
    this.runOne('Execute Payout', () => this.flow.executePayout(payload));
  }
}


