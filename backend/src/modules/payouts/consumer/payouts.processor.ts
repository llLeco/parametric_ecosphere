import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { INS_PAYOUTS_QUEUE } from '../../../common/bull/queues';
import { PayoutsModelService } from '../model/payouts.model.service';
import { SmartNodeCommonService } from '../../smartnode-common.service';
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
    const res = (this.smartNode as any).submitMessageToTopic
      ? await (this.smartNode as any).submitMessageToTopic(topicId, { type: 'PayoutExecuted', ...dto })
      : await (this.smartNode as any).publishMessage?.(topicId, { type: 'PayoutExecuted', ...dto });
    await this.model.create({ ...dto, msgTs: res.consensusTimestamp });
    this.events.emit('ins.payout.executed', { policyId: dto.policyId, consensusTimestamp: res.consensusTimestamp });
    return { consensusTimestamp: res.consensusTimestamp };
  }

  @Process('stop-loss')
  async stopLoss(job: Job) {
    const dto = job.data;
    const topicId = await this.getPayoutsTopicId(dto.policyId);
    const res = (this.smartNode as any).submitMessageToTopic
      ? await (this.smartNode as any).submitMessageToTopic(topicId, { type: 'StopLossBreached', ...dto })
      : await (this.smartNode as any).publishMessage?.(topicId, { type: 'StopLossBreached', ...dto });
    await this.model.create({ ...dto, msgTs: res.consensusTimestamp });
    return { consensusTimestamp: res.consensusTimestamp };
  }
}


