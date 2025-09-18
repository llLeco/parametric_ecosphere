import { Injectable } from '@angular/core';
import { ContextStore, FlowContext } from '../store/context.store';
import { AxiosService } from './axios/axios.service';

export interface StepResult {
  ok: boolean;
  request: { method: string; url: string; headers: Record<string,string>; body?: any };
  response?: any;
  error?: any;
  consensusTimestamp?: string;
}

@Injectable({ providedIn: 'root' })
export class FlowRunnerService {
  constructor(private readonly ctx: ContextStore) {
    // Configure AxiosService with the base URL from context
    AxiosService.configure(this.ctx.snapshot.baseUrl);
  }

  private async post<T>(path: string, body: any, role: keyof FlowContext['wallets']): Promise<StepResult> {
    const baseUrl = this.ctx.snapshot.baseUrl;
    const url = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
    const walletId = this.ctx.snapshot.wallets[role];
    const headers = { 'x-wallet-id': walletId };
    const request = { method: 'POST', url, headers, body };

    try {
      // Ensure AxiosService is configured with current base URL
      AxiosService.configure(baseUrl);

      const axiosResponse = await AxiosService.post<any>(walletId, path, body);
      const res = axiosResponse.data;
      const consensusTimestamp = res?.consensusTimestamp || res?.statusInitConsensusTimestamp || res?.ts;
      return { ok: true, request, response: res, consensusTimestamp };
    } catch (error: any) {
      const errorResponse = error.response?.data || error.message || error;
      return { ok: false, request, error: errorResponse };
    }
  }

  private async get<T>(path: string, role: keyof FlowContext['wallets']): Promise<StepResult> {
    const baseUrl = this.ctx.snapshot.baseUrl;
    const url = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
    const walletId = this.ctx.snapshot.wallets[role];
    const headers = { 'x-wallet-id': walletId };
    const request = { method: 'GET', url, headers };

    try {
      // Ensure AxiosService is configured with current base URL
      AxiosService.configure(baseUrl);

      const axiosResponse = await AxiosService.get<any>(walletId, path);
      const res = axiosResponse.data;
      return { ok: true, request, response: res };
    } catch (error: any) {
      const errorResponse = error.response?.data || error.message || error;
      return { ok: false, request, error: errorResponse };
    }
  }

  async createRule(payload?: any) {
    const body = payload || {
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
    const result = await this.post('/rules', body, 'admin');
    if (result.ok) {
      const ruleTs = result.response?.ruleRef?.ts || result.response?.consensusTimestamp || result.consensusTimestamp;
      this.ctx.update({ rule: { ruleId: body.ruleId, ruleRef: { ts: ruleTs, topicId: '0.0.123456' } } });
      if (ruleTs) this.ctx.appendTimeline({ type: 'rule', label: `Rule ${body.ruleId}`, meta: { ts: ruleTs } });
    }
    return result;
  }

  async createPolicy(payload?: any) {
    const ruleTs = this.ctx.snapshot.rule?.ruleRef?.ts || `${Date.now()}`;
    const body = payload || {
      policyId: `pol_${Date.now()}`,
      beneficiary: this.ctx.snapshot.wallets.beneficiary,
      location: 'São Paulo, Brazil',
      sumInsured: 100000,
      premium: 10000,
      retention: 80000,
      validity: {
        from: new Date().toISOString().split('T')[0],
        to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      ruleRef: {
        topicId: this.ctx.snapshot.rule?.ruleRef?.topicId || '0.0.123456',
        ts: ruleTs
      }
    };
    const result = await this.post('/policy-factory', body, 'admin');
    if (result.ok) {
      const { statusTopicId, payoutsTopicId, statusInitConsensusTimestamp } = result.response || {};
      this.ctx.update({ policy: { policyId: body.policyId, statusTopicId, payoutsTopicId, statusInitTs: statusInitConsensusTimestamp } });
      if (statusTopicId) this.ctx.appendTimeline({ type: 'policy', label: `Policy ${body.policyId}`, meta: { statusTopicId, payoutsTopicId } });
    }
    return result;
  }

  async poolDeposit(payload?: any) {
    const body = payload || {
      poolId: 'pool_1',
      amount: 500000,
      currencyTokenId: '0.0.STABLESIM',
      ref: `deposit_${Date.now()}`
    };
    const result = await this.post('/pool-events/pool/deposit', body, 'contributor');
    if (result.ok) this.ctx.appendTimeline({ type: 'pool', label: 'Pool Deposit', meta: { amount: body.amount } });
    return result;
  }

  async poolPremium(payload?: any) {
    const policyId = this.ctx.snapshot.policy?.policyId || `pol_${Date.now()}`;
    const body = payload || {
      poolId: 'pool_1',
      policyId,
      amount: 10000,
      currencyTokenId: '0.0.STABLESIM',
      ref: `premium_${Date.now()}`
    };
    const result = await this.post('/pool-events/pool/premium', body, 'beneficiary');
    if (result.ok) this.ctx.appendTimeline({ type: 'pool', label: 'Premium to Pool', meta: { amount: body.amount } });
    return result;
  }

  async triggerEvent(payload?: any) {
    const policyId = this.ctx.snapshot.policy?.policyId || `pol_${Date.now()}`;
    const ruleTs = this.ctx.snapshot.rule?.ruleRef?.ts || `${Date.now()}`;
    const body = payload || {
      type: 'weather',
      policyId,
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
        topicId: this.ctx.snapshot.rule?.ruleRef?.topicId || '0.0.123456',
        ts: ruleTs
      },
      oracleSig: `oracle_signature_${Date.now()}`,
      smartNodeSig: `smartnode_signature_${Date.now()}`
    };
    const result = await this.post('/triggers', body, 'oracle');
    if (result.ok) {
      const trigTs = result.response?.consensusTimestamp || result.consensusTimestamp;
      this.ctx.update({ trigger: { ts: trigTs, topicId: '0.0.TRIGGER_TOPIC' } });
      if (trigTs) this.ctx.appendTimeline({ type: 'trigger', label: 'Weather Event Triggered (36.5°C > 35°C)', meta: { ts: trigTs } });
    }
    return result;
  }

  async cessionRequest(payload?: any) {
    const policyId = this.ctx.snapshot.policy?.policyId || `pol_${Date.now()}`;
    const body = payload || {
      policyId,
      excessAmount: 20000,
      triggerRef: `trigger_${Date.now()}`,
      ruleRef: `rule_${Date.now()}`,
      lossCum: 100000,
      retention: 80000
    };
    const result = await this.post('/cession/requested', body, 'admin');
    if (result.ok) this.ctx.appendTimeline({ type: 'cession', label: 'Cession Requested (20,000 tokens excess)' });
    return result;
  }

  async cessionFunded(payload?: any) {
    const policyId = this.ctx.snapshot.policy?.policyId || `pol_${Date.now()}`;
    const body = payload || {
      policyId,
      amount: 20000,
      reinsurer: this.ctx.snapshot.wallets.reinsurer,
      txId: `tx_${Date.now()}`,
      ruleRef: `rule_${Date.now()}`,
      cessionRef: `cession_${Date.now()}`
    };
    const result = await this.post('/cession/funded', body, 'reinsurer');
    if (result.ok) this.ctx.appendTimeline({ type: 'cession', label: 'Cession Funded (20,000 tokens from reinsurer)' });
    return result;
  }

  async executePayout(payload?: any) {
    const policyId = this.ctx.snapshot.policy?.policyId || `pol_${Date.now()}`;
    const body = payload || {
      beneficiary: this.ctx.snapshot.wallets.beneficiary,
      amount: 80000,
      source: 'POOL',
      triggerRef: `trigger_${Date.now()}`,
      ruleRef: `rule_${Date.now()}`,
      sourceRef: `pool_${Date.now()}`,
      statusRef: `status_${Date.now()}`,
      txId: `tx_${Date.now()}`
    };
    const result = await this.post(`/payouts/${policyId}/execute`, body, 'admin');
    if (result.ok) {
      const ts = result.response?.consensusTimestamp || result.consensusTimestamp;
      this.ctx.update({ payout: { ts } });
      if (ts) this.ctx.appendTimeline({ type: 'payout', label: 'Pool Payout Executed (80,000 tokens - stop-loss)', meta: { ts } });
    }
    return result;
  }

  async executeFinalPayout(payload?: any) {
    const policyId = this.ctx.snapshot.policy?.policyId || `pol_${Date.now()}`;
    const body = payload || {
      beneficiary: this.ctx.snapshot.wallets.beneficiary,
      amount: 20000,
      source: 'CESSION',
      triggerRef: `trigger_${Date.now()}`,
      ruleRef: `rule_${Date.now()}`,
      sourceRef: `cession_${Date.now()}`,
      statusRef: `status_${Date.now()}`,
      txId: `tx_${Date.now()}`
    };
    const result = await this.post(`/payouts/${policyId}/execute`, body, 'admin');
    if (result.ok) {
      const ts = result.response?.consensusTimestamp || result.consensusTimestamp;
      this.ctx.update({ finalPayout: { ts } });
      if (ts) this.ctx.appendTimeline({ type: 'payout', label: 'Final Payout Executed (20,000 tokens from cession)', meta: { ts } });
    }
    return result;
  }

  // GET methods for retrieving policy data (working endpoints)
  async getPolicy(policyId: string) { return this.get(`/registry/policies/${policyId}`, 'admin'); }
  async findPoliciesByBeneficiary(beneficiary: string) { return this.get(`/registry/policies?beneficiary=${encodeURIComponent(beneficiary)}`, 'admin'); }
  async listPolicies() { return this.get('/registry/policies', 'admin'); }

  async runAll(onStep?: (name: string, res: StepResult) => void, stopOnError = true) {
    const steps: Array<[string, () => Promise<StepResult>]> = [
      ['Create Rule', () => this.createRule()],
      ['Create Policy', () => this.createPolicy()],
      ['Pool Deposit', () => this.poolDeposit()],
      ['Pay Premium', () => this.poolPremium()],
      ['Trigger Weather Event', () => this.triggerEvent()],
      ['Execute Pool Payout', () => this.executePayout()],
      ['Request Cession', () => this.cessionRequest()],
      ['Fund Cession', () => this.cessionFunded()],
      ['Execute Final Payout', () => this.executeFinalPayout()],
    ];
    for (const [name, fn] of steps) {
      const res = await fn();
      onStep?.(name, res);
      if (!res.ok && stopOnError) break;
    }
  }
}


