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
      ruleId: `rule_temp_threshold_${Date.now()}`,
      indexDef: {
        metric: 'temperature',
        operator: '>',
        threshold: 35.0,
        windowDays: 21,
        unit: 'celsius'
      },
      payout: {
        amount: 100000,
        currencyTokenId: '0.0.STABLESIM'
      },
      validity: {
        from: new Date().toISOString(),
        to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
    return JSON.stringify(body, null, 2);
  }

  get createPolicyTemplate(): string {
    const snapshot = this.ctx.snapshot;
    const ruleTs = snapshot.rule?.ruleRef?.ts || `${Date.now()}`;
    const body = {
      policyId: `pol_${Date.now()}`,
      beneficiary: snapshot.wallets.beneficiary,
      location: 'São Paulo, Brazil',
      sumInsured: 100000,
      premium: 10000,
      retention: 80000,
      validity: {
        from: new Date().toISOString().split('T')[0],
        to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      ruleRef: {
        topicId: snapshot.rule?.ruleRef?.topicId || '0.0.123456',
        ts: ruleTs
      }
    };
    return JSON.stringify(body, null, 2);
  }

  get poolDepositTemplate(): string {
    const body = {
      poolId: 'pool_1',
      amount: 500000,
      currencyTokenId: '0.0.STABLESIM',
      ref: `deposit_${Date.now()}`
    };
    return JSON.stringify(body, null, 2);
  }

  get premiumToPoolTemplate(): string {
    const snapshot = this.ctx.snapshot;
    const body = {
      poolId: 'pool_1',
      policyId: snapshot.policy?.policyId || `pol_${Date.now()}`,
      amount: 10000,
      currencyTokenId: '0.0.STABLESIM',
      ref: `premium_${Date.now()}`
    };
    return JSON.stringify(body, null, 2);
  }

  get triggerTemplate(): string {
    const snapshot = this.ctx.snapshot;
    const ruleTs = snapshot.rule?.ruleRef?.ts || `${Date.now()}`;
    const body = {
      type: 'weather',
      policyId: snapshot.policy?.policyId || `pol_${Date.now()}`,
      location: 'São Paulo, Brazil',
      index: {
        parameter: 'temperature',
        value: 36.5,
        unit: 'celsius',
        threshold: 35.0
      },
      window: {
        from: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString()
      },
      ruleRef: {
        topicId: snapshot.rule?.ruleRef?.topicId || '0.0.123456',
        ts: ruleTs
      },
      oracleSig: `oracle_signature_${Date.now()}`,
      smartNodeSig: `smartnode_signature_${Date.now()}`
    };
    return JSON.stringify(body, null, 2);
  }

  get payoutTemplate(): string {
    const snapshot = this.ctx.snapshot;
    const body = {
      beneficiary: snapshot.wallets.beneficiary,
      amount: 80000,
      source: 'POOL',
      triggerRef: `trigger_${Date.now()}`,
      ruleRef: `rule_${Date.now()}`,
      sourceRef: `pool_${Date.now()}`,
      statusRef: `status_${Date.now()}`,
      txId: `tx_${Date.now()}`
    };
    return JSON.stringify(body, null, 2);
  }

  get cessionRequestTemplate(): string {
    const snapshot = this.ctx.snapshot;
    const body = {
      policyId: snapshot.policy?.policyId || `pol_${Date.now()}`,
      excessAmount: 20000,
      triggerRef: `trigger_${Date.now()}`,
      ruleRef: `rule_${Date.now()}`,
      lossCum: 100000,
      retention: 80000
    };
    return JSON.stringify(body, null, 2);
  }

  get cessionFundedTemplate(): string {
    const snapshot = this.ctx.snapshot;
    const body = {
      policyId: snapshot.policy?.policyId || `pol_${Date.now()}`,
      amount: 20000,
      reinsurer: snapshot.wallets.reinsurer,
      txId: `tx_${Date.now()}`,
      ruleRef: `rule_${Date.now()}`,
      cessionRef: `cession_${Date.now()}`
    };
    return JSON.stringify(body, null, 2);
  }

  get finalPayoutTemplate(): string {
    const snapshot = this.ctx.snapshot;
    const body = {
      beneficiary: snapshot.wallets.beneficiary,
      amount: 20000,
      source: 'CESSION',
      triggerRef: `trigger_${Date.now()}`,
      ruleRef: `rule_${Date.now()}`,
      sourceRef: `cession_${Date.now()}`,
      statusRef: `status_${Date.now()}`,
      txId: `tx_${Date.now()}`
    };
    return JSON.stringify(body, null, 2);
  }

  // GET operation templates (for policy operations only)
  get getPolicyTemplate(): string {
    const snapshot = this.ctx.snapshot;
    const params = {
      policyId: snapshot.policy?.policyId || 'pol_001'
    };
    return JSON.stringify(params, null, 2);
  }

  get listPoliciesTemplate(): string {
    const snapshot = this.ctx.snapshot;
    const params = {
      beneficiary: snapshot.wallets.beneficiary || '',
      location: 'hex_lat19.9_lng43.9'
    };
    return JSON.stringify(params, null, 2);
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

  onPoolDeposit(payload?: any) {
    this.runOne('Pool Deposit', () => this.flow.poolDeposit(payload));
  }

  onPayPremium(payload?: any) {
    this.runOne('Pay Premium', () => this.flow.poolPremium(payload));
  }

  onTriggerWeatherEvent(payload?: any) {
    this.runOne('Trigger Weather Event', () => this.flow.triggerEvent(payload));
  }

  onExecutePoolPayout(payload?: any) {
    this.runOne('Execute Pool Payout', () => this.flow.executePayout(payload));
  }

  onRequestCession(payload?: any) {
    this.runOne('Request Cession', () => this.flow.cessionRequest(payload));
  }

  onFundCession(payload?: any) {
    this.runOne('Fund Cession', () => this.flow.cessionFunded(payload));
  }

  onExecuteFinalPayout(payload?: any) {
    this.runOne('Execute Final Payout', () => this.flow.executeFinalPayout(payload));
  }

  // GET operation handlers (policy operations only)
  onGetPolicy(params?: any) {
    const policyId = params?.policyId || this.ctx.snapshot.policy?.policyId || 'pol_001';
    this.runOne('Get Policy', () => this.flow.getPolicy(policyId));
  }

  onListPolicies(params?: any) {
    this.runOne('List Policies', () => this.flow.listPolicies());
  }

  onFindPoliciesByBeneficiary(params?: any) {
    const beneficiary = params?.beneficiary || this.ctx.snapshot.wallets.beneficiary;
    this.runOne('Find Policies by Beneficiary', () => this.flow.findPoliciesByBeneficiary(beneficiary));
  }
}


