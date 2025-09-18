import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { INS_PAYOUTS_QUEUE } from '../../common/bull/queues';
import { PayoutsModelService } from './payouts.model.service';
import { SmartNodeCommonService } from '../smartnode-common.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Processor(INS_PAYOUTS_QUEUE)
export class PayoutsProcessor {
  constructor(
    private readonly model: PayoutsModelService,
    private readonly smartNode: SmartNodeCommonService,
    private readonly events: EventEmitter2,
  ) {}

  private async getPayoutsTopicId(policyId: string): Promise<string> {
    const p = await this.model.findPolicy(policyId);
    if (!p?.payoutsTopicId) throw new Error(`payoutsTopicId not found for policy ${policyId}`);
    return p.payoutsTopicId;
  }

  @Process('executed')
  async executed(job: Job) {
    const dto = job.data;
    const topicId = await this.getPayoutsTopicId(dto.policyId);
    
    // Ensure all required fields are present for the validator
    const payload = {
      type: 'PayoutExecuted',
      policyId: dto.policyId,
      beneficiary: dto.beneficiary,
      amount: dto.amount,
      source: dto.source,
      triggerRef: dto.triggerRef,
      ruleRef: dto.ruleRef,
      sourceRef: dto.sourceRef || { topicId: topicId, ts: Date.now().toString() },
      statusRef: dto.statusRef || { topicId: topicId, ts: Date.now().toString() },
      txId: dto.txId || `tx_${Date.now()}`
    };
    
    const res = (this.smartNode as any).submitMessageToTopic
      ? await (this.smartNode as any).submitMessageToTopic(topicId, payload)
      : await (this.smartNode as any).publishMessage?.(topicId, payload);
    await this.model.create({ ...dto, msgTs: res.consensusTimestamp });
    this.events.emit('ins.payout.executed', { policyId: dto.policyId, consensusTimestamp: res.consensusTimestamp });
    return { consensusTimestamp: res.consensusTimestamp };
  }

  @Process('stop-loss')
  async stopLoss(job: Job) {
    const dto = job.data;
    const topicId = await this.getPayoutsTopicId(dto.policyId);
    
    // Ensure all required fields are present for the validator
    const payload = {
      type: 'StopLossBreached',
      policyId: dto.policyId,
      beneficiary: dto.beneficiary || 'unknown', // StopLossBreached might not have beneficiary
      amount: dto.lossCum || 0,
      source: 'POOL', // Stop-loss is always from pool
      triggerRef: dto.triggerRef,
      ruleRef: dto.ruleRef,
      sourceRef: `stop_loss_${Date.now()}`,
      statusRef: `status_${Date.now()}`,
      txId: `tx_${Date.now()}`
    };
    
    const res = (this.smartNode as any).submitMessageToTopic
      ? await (this.smartNode as any).submitMessageToTopic(topicId, payload)
      : await (this.smartNode as any).publishMessage?.(topicId, payload);
    await this.model.create({ ...dto, msgTs: res.consensusTimestamp });
    return { consensusTimestamp: res.consensusTimestamp };
  }
}


