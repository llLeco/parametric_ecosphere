import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { INS_REGISTRY_QUEUE } from '../../../common/bull/queues';
import { RegistryModelService } from '../model/registry.model.service';
import { SmartNodeCommonService } from '../../smartnode-common.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InsPolicyRegisteredEvent } from '../events/ins-policy-registered.event';

@Processor(INS_REGISTRY_QUEUE)
export class RegistryProcessor {
  constructor(
    private readonly model: RegistryModelService,
    private readonly smartNode: SmartNodeCommonService,
    private readonly events: EventEmitter2,
  ) {}

  @Process('create-policy')
  async handleCreatePolicy(job: Job) {
    const dto = job.data;
    // persist first (optimistic)
    await this.model.create({ ...dto });

    // publish to HCS
    const config = await (this.smartNode as any).getConfig?.();
    if (!config?.policyRegistryTopicId) throw new Error('policyRegistryTopicId missing in config');
    const payload = {
      type: 'PolicyRegistered',
      ...dto,
    };
    const result = await (this.smartNode as any).submitMessageToTopic
      ? (this.smartNode as any).submitMessageToTopic(config.policyRegistryTopicId, payload)
      : (this.smartNode as any).publishMessage?.(config.policyRegistryTopicId, payload);

    const consensusTimestamp: string = result.consensusTimestamp || result?.consensusTimestamp;
    if (consensusTimestamp) {
      await this.model.updateConsensusTimestamp(dto.policyId, consensusTimestamp);
      this.events.emit(
        'ins.policy.registered',
        new InsPolicyRegisteredEvent(dto.policyId, consensusTimestamp),
      );
    }

    return { consensusTimestamp };
  }
}


