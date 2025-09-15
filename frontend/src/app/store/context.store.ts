import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type WalletRole = 'admin' | 'oracle' | 'beneficiary' | 'contributor' | 'reinsurer';

export interface FlowContext {
  baseUrl: string;
  mockMode: boolean;
  wallets: Record<WalletRole, string>;
  headers: Record<string, string>;
  rule?: { ruleId: string; ruleRef?: { ts: string; topicId?: string } };
  policy?: {
    policyId: string;
    statusTopicId?: string;
    payoutsTopicId?: string;
    statusInitTs?: string;
  };
  trigger?: { ts: string; topicId?: string };
  payout?: { ts: string };
  timeline: Array<{ ts: string; type: string; label: string; meta?: any }>;
}

const DEFAULT_CONTEXT: FlowContext = {
  baseUrl: 'http://localhost:8888',
  mockMode: true,
  wallets: {
    admin: '0.0.5173509',
    oracle: '0.0.6801945',
    beneficiary: '0.0.6801946',
    contributor: '0.0.6801948',
    reinsurer: '0.0.6801949',
  },
  headers: {},
  timeline: [],
};

@Injectable({ providedIn: 'root' })
export class ContextStore {
  private readonly key = 'parametric_flow_context_v1';
  private readonly subject = new BehaviorSubject<FlowContext>(this.loadInitial());
  readonly state$ = this.subject.asObservable();

  get snapshot(): FlowContext { return this.subject.getValue(); }

  set<K extends keyof FlowContext>(key: K, value: FlowContext[K]) {
    const next = { ...this.snapshot, [key]: value } as FlowContext;
    this.setAll(next);
  }

  setAll(ctx: FlowContext) {
    this.subject.next(ctx);
    localStorage.setItem(this.key, JSON.stringify(ctx));
  }

  update(partial: Partial<FlowContext>) {
    this.setAll({ ...this.snapshot, ...partial });
  }

  appendTimeline(entry: { ts?: string; type: string; label: string; meta?: any }) {
    const ts = entry.ts || new Date().toISOString();
    const timeline = [...this.snapshot.timeline, { ...entry, ts }];
    this.update({ timeline });
  }

  clearTimeline() { this.update({ timeline: [] }); }

  private loadInitial(): FlowContext {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) {
        const parsed = JSON.parse(raw) as FlowContext;
        return { ...DEFAULT_CONTEXT, ...parsed, wallets: { ...DEFAULT_CONTEXT.wallets, ...(parsed.wallets || {}) } };
      }
    } catch {}
    return DEFAULT_CONTEXT;
  }
}


