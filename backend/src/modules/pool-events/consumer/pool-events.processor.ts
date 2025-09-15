import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { INS_POOL_EVENTS_QUEUE } from '../../../common/bull/queues';
import { PoolEventsModelService } from '../model/pool-events.model.service';
import { SmartNodeCommonService } from '../../smartnode-common.service';

@Processor(INS_POOL_EVENTS_QUEUE)
export class PoolEventsProcessor {
  constructor(
    private readonly model: PoolEventsModelService,
    private readonly smartNode: SmartNodeCommonService,
  ) {}

  private async publish(type: string, payload: any) {
    const cfg = await (this.smartNode as any).getConfig?.();
    if (!cfg?.poolEventsTopicId) throw new Error('poolEventsTopicId missing in config');
    const res = (this.smartNode as any).submitMessageToTopic
      ? await (this.smartNode as any).submitMessageToTopic(cfg.poolEventsTopicId, { type, ...payload })
      : await (this.smartNode as any).publishMessage?.(cfg.poolEventsTopicId, { type, ...payload });
    return res.consensusTimestamp;
  }

  @Process('deposit')
  async deposit(job: Job) { const ts = await this.publish('PoolDeposit', job.data); await this.model.create({ ...job.data, type: 'deposit', msgTs: ts }); return { consensusTimestamp: ts }; }
  @Process('premium')
  async premium(job: Job) { const ts = await this.publish('PoolPremium', job.data); await this.model.create({ ...job.data, type: 'premium', msgTs: ts }); return { consensusTimestamp: ts }; }
  @Process('payout-debited')
  async payoutDebited(job: Job) { const ts = await this.publish('PoolPayoutDebited', job.data); await this.model.create({ ...job.data, type: 'payout-debited', msgTs: ts }); return { consensusTimestamp: ts }; }
  @Process('nav')
  async nav(job: Job) { const ts = await this.publish('NavSnapshot', job.data); await this.model.create({ ...job.data, type: 'nav', msgTs: ts }); return { consensusTimestamp: ts }; }
}


