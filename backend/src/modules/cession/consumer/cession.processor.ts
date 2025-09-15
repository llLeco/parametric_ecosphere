import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { INS_CESSION_QUEUE } from '../../../common/bull/queues';
import { CessionModelService } from '../model/cession.model.service';
import { SmartNodeCommonService } from '../../smartnode-common.service';

@Processor(INS_CESSION_QUEUE)
export class CessionProcessor {
  constructor(
    private readonly model: CessionModelService,
    private readonly smartNode: SmartNodeCommonService,
  ) {}

  private async publish(type: string, payload: any) {
    const cfg = await (this.smartNode as any).getConfig?.();
    if (!cfg?.cessionTopicId) throw new Error('cessionTopicId missing in config');
    const res = (this.smartNode as any).submitMessageToTopic
      ? await (this.smartNode as any).submitMessageToTopic(cfg.cessionTopicId, { type, ...payload })
      : await (this.smartNode as any).publishMessage?.(cfg.cessionTopicId, { type, ...payload });
    return res.consensusTimestamp;
  }

  @Process('requested')
  async requested(job: Job) { const ts = await this.publish('CessionRequested', job.data); await this.model.create({ ...job.data, msgTs: ts }); return { consensusTimestamp: ts }; }
  @Process('funded')
  async funded(job: Job) { const ts = await this.publish('CessionFunded', job.data); await this.model.create({ ...job.data, msgTs: ts }); return { consensusTimestamp: ts }; }
}


