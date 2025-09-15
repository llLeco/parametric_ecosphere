import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ContextStore, FlowContext } from '../store/context.store';

export interface StepResult {
  ok: boolean;
  request: { method: string; url: string; headers: Record<string,string>; body?: any };
  response?: any;
  error?: any;
  consensusTimestamp?: string;
}

@Injectable({ providedIn: 'root' })
export class FlowRunnerService {
  constructor(private readonly http: HttpClient, private readonly ctx: ContextStore) {}

  private buildHeaders(role: keyof FlowContext['wallets']): Record<string,string> {
    const wallet = this.ctx.snapshot.wallets[role];
    return { 'x-wallet-id': wallet };
  }

  private async post<T>(path: string, body: any, role: keyof FlowContext['wallets']): Promise<StepResult> {
    const baseUrl = this.ctx.snapshot.baseUrl;
    const url = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
    const headers = this.buildHeaders(role);
    const request = { method: 'POST', url, headers, body };
    try {
      const res = await firstValueFrom(this.http.post<any>(url, body, { headers: new HttpHeaders(headers) }));
      const consensusTimestamp = res?.consensusTimestamp || res?.statusInitConsensusTimestamp || res?.ts;
      return { ok: true, request, response: res, consensusTimestamp };
    } catch (error) {
      return { ok: false, request, error };
    }
  }

  private async get<T>(path: string, role: keyof FlowContext['wallets']): Promise<StepResult> {
    const baseUrl = this.ctx.snapshot.baseUrl;
    const url = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
    const headers = this.buildHeaders(role);
    const request = { method: 'GET', url, headers };
    try {
      const res = await firstValueFrom(this.http.get<any>(url, { headers: new HttpHeaders(headers) }));
      return { ok: true, request, response: res };
    } catch (error) {
      return { ok: false, request, error };
    }
  }

  async createRule(payload?: any) {
    const body = payload || {
      ruleId: 'rule_rainfall_hex_001',
      indexDef: { metric: 'rain_30d_mm', operator: '<', threshold: 50, windowDays: 21 },
      payout: { amount: 100000, currencyTokenId: '0.0.STABLESIM' },
      validity: { from: '2025-09-01T00:00:00Z', to: '2026-08-31T23:59:59Z' }
    };
    const result = await this.post('/rules', body, 'admin');
    if (result.ok) {
      const ruleTs = result.response?.ruleRef?.ts || result.response?.consensusTimestamp || result.consensusTimestamp;
      this.ctx.update({ rule: { ruleId: body.ruleId, ruleRef: { ts: ruleTs } } });
      if (ruleTs) this.ctx.appendTimeline({ type: 'rule', label: `Rule ${body.ruleId}`, meta: { ts: ruleTs } });
    }
    return result;
  }

  async createPolicy(payload?: any) {
    const ruleTs = this.ctx.snapshot.rule?.ruleRef?.ts || '<RULE_TS>';
    const body = payload || {
      policyId: 'pol_001',
      beneficiary: this.ctx.snapshot.wallets.beneficiary,
      location: 'hex_lat19.9_lng43.9',
      sumInsured: 100000,
      premium: 10000,
      retention: 80000,
      validity: { from: '2025-09-01', to: '2026-08-31' },
      ruleRef: { topicId: '<TOPIC_RULES>', ts: ruleTs }
    };
    const result = await this.post('/policy-factory', body, 'admin');
    if (result.ok) {
      const { statusTopicId, payoutsTopicId, statusInitConsensusTimestamp } = result.response || {};
      this.ctx.update({ policy: { policyId: body.policyId, statusTopicId, payoutsTopicId, statusInitTs: statusInitConsensusTimestamp } });
      if (statusTopicId) this.ctx.appendTimeline({ type: 'policy', label: `Policy ${body.policyId}`, meta: { statusTopicId, payoutsTopicId } });
    }
    return result;
  }

  async poolPremium(payload?: any) {
    const policyId = this.ctx.snapshot.policy?.policyId || 'pol_001';
    const body = payload || { poolId: 'pool_1', policyId, from: this.ctx.snapshot.wallets.beneficiary, amount: 10000, currencyTokenId: '0.0.STABLESIM' };
    const result = await this.post('/pool-events/pool/premium', body, 'admin');
    if (result.ok) this.ctx.appendTimeline({ type: 'pool', label: 'Premium to Pool', meta: { amount: body.amount } });
    return result;
  }

  async triggerEvent(payload?: any) {
    const policyId = this.ctx.snapshot.policy?.policyId || 'pol_001';
    const ruleTs = this.ctx.snapshot.rule?.ruleRef?.ts || '<RULE_TS>';
    const body = payload || {
      policyId,
      location: 'hex_lat19.9_lng43.9',
      index: { rain_30d_mm: 12.4 },
      window: { from: '2025-08-01', to: '2025-08-21' },
      ruleRef: { topicId: '<TOPIC_RULES>', ts: ruleTs },
      oracleSig: 'MOCK_SIGNATURE'
    };
    const result = await this.post('/triggers', body, 'oracle');
    if (result.ok) {
      const trigTs = result.response?.consensusTimestamp || result.consensusTimestamp;
      this.ctx.update({ trigger: { ts: trigTs } });
      if (trigTs) this.ctx.appendTimeline({ type: 'trigger', label: 'Trigger Event', meta: { ts: trigTs } });
    }
    return result;
  }

  async cessionRequest(payload?: any) {
    const policyId = this.ctx.snapshot.policy?.policyId || 'pol_001';
    const body = payload || { policyId, excessAmount: 10000, triggerRef: 'TRIGREF', ruleRef: 'RULEREF', lossCum: 50000, retention: 80000 };
    const result = await this.post('/cession/cession/request', body, 'admin');
    if (result.ok) this.ctx.appendTimeline({ type: 'cession', label: 'Cession Requested' });
    return result;
  }

  async cessionFunded(payload?: any) {
    const policyId = this.ctx.snapshot.policy?.policyId || 'pol_001';
    const body = payload || { policyId, amount: 100000, reinsurer: this.ctx.snapshot.wallets.reinsurer, txId: '0.0.mock@tx', ruleRef: 'RULEREF' };
    const result = await this.post('/cession/cession/funded', body, 'reinsurer');
    if (result.ok) this.ctx.appendTimeline({ type: 'cession', label: 'Cession Funded' });
    return result;
  }

  async executePayout(payload?: any) {
    const policyId = this.ctx.snapshot.policy?.policyId || 'pol_001';
    const body = payload || {
      policyId,
      beneficiary: this.ctx.snapshot.wallets.beneficiary,
      amount: 100000,
      source: 'POOL',
      triggerRef: { topicId: '<TOPIC_TRIGGERS>', ts: this.ctx.snapshot.trigger?.ts || '<TRIGGER_TS>' },
      ruleRef: { topicId: '<TOPIC_RULES>', ts: this.ctx.snapshot.rule?.ruleRef?.ts || '<RULE_TS>' },
      statusRef: { topicId: this.ctx.snapshot.policy?.statusTopicId || '<STATUS_TOPIC_ID>', ts: this.ctx.snapshot.policy?.statusInitTs || '<STATUS_INIT_TS>' },
      txId: '0.0.5173509@mock'
    };
    const result = await this.post(`/payouts/${policyId}/execute`, body, 'admin');
    if (result.ok) {
      const ts = result.response?.consensusTimestamp || result.consensusTimestamp;
      this.ctx.update({ payout: { ts } });
      if (ts) this.ctx.appendTimeline({ type: 'payout', label: 'Payout Executed', meta: { ts } });
    }
    return result;
  }

  async getPolicy(policyId: string) { return this.get(`/registry/policies/${policyId}`, 'admin'); }
  async findPoliciesByBeneficiary(beneficiary: string) { return this.get(`/registry/policies?beneficiary=${encodeURIComponent(beneficiary)}`, 'admin'); }

  async runAll(onStep?: (name: string, res: StepResult) => void, stopOnError = true) {
    const steps: Array<[string, () => Promise<StepResult>]> = [
      ['Create Rule', () => this.createRule()],
      ['Create Policy', () => this.createPolicy()],
      ['Premium to Pool', () => this.poolPremium()],
      ['Trigger Event', () => this.triggerEvent()],
      ['Execute Payout', () => this.executePayout()],
    ];
    for (const [name, fn] of steps) {
      const res = await fn();
      onStep?.(name, res);
      if (!res.ok && stopOnError) break;
    }
  }
}


