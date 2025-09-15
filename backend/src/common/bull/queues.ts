export const INS_REGISTRY_QUEUE = 'ins:registry';
export const INS_RULES_QUEUE = 'ins:rules';
export const INS_TRIGGERS_QUEUE = 'ins:triggers';
export const INS_POLICY_STATUS_QUEUE = 'ins:policy-status';
export const INS_POOL_EVENTS_QUEUE = 'ins:pool-events';
export const INS_PAYOUTS_QUEUE = 'ins:payouts';
export const INS_CESSION_QUEUE = 'ins:cession';
export const INS_BILLING_QUEUE = 'ins:billing';
export const INS_NAV_QUEUE = 'ins:nav';

export type InsuranceQueueName =
  | typeof INS_REGISTRY_QUEUE
  | typeof INS_RULES_QUEUE
  | typeof INS_TRIGGERS_QUEUE
  | typeof INS_POLICY_STATUS_QUEUE
  | typeof INS_POOL_EVENTS_QUEUE
  | typeof INS_PAYOUTS_QUEUE
  | typeof INS_CESSION_QUEUE
  | typeof INS_BILLING_QUEUE
  | typeof INS_NAV_QUEUE;


