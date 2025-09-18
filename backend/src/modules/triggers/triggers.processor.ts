import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { INS_TRIGGERS_QUEUE } from '../../common/bull/queues';
import { TriggersModelService } from './triggers.model.service';
import { SmartNodeCommonService } from '../smartnode-common.service';

@Processor(INS_TRIGGERS_QUEUE)
export class TriggersProcessor {
  constructor(
    private readonly model: TriggersModelService,
    private readonly smartNode: SmartNodeCommonService,
  ) {}

  @Process('trigger-event')
  async handleTrigger(job: Job) {
    const dto = job.data;
    const cfg = await (this.smartNode as any).getConfig?.();
    if (!cfg?.triggersTopicId) throw new Error('triggersTopicId missing in config');

    const payload = { type: 'TriggerEvent', ...dto };
    const res = (this.smartNode as any).submitMessageToTopic
      ? await (this.smartNode as any).submitMessageToTopic(cfg.triggersTopicId, payload)
      : await (this.smartNode as any).publishMessage?.(cfg.triggersTopicId, payload);

    await this.model.create({ ...dto, trigTs: res.consensusTimestamp, ruleRef: dto.ruleRef });
    return { consensusTimestamp: res.consensusTimestamp };
  }
}


