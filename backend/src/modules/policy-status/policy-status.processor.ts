import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { INS_POLICY_STATUS_QUEUE } from '../../common/bull/queues';
import { PolicyStatusModelService } from './policy-status.model.service';
import { SmartNodeCommonService } from '../smartnode-common.service';

@Processor(INS_POLICY_STATUS_QUEUE)
export class PolicyStatusProcessor {
  constructor(
    private readonly model: PolicyStatusModelService,
    private readonly smartNode: SmartNodeCommonService,
  ) {}

  private async getStatusTopicId(policyId: string): Promise<string> {
    const p = await this.model.findPolicy(policyId);
    if (!p?.statusTopicId) throw new Error(`statusTopicId not found for policy ${policyId}`);
    return p.statusTopicId;
  }

  @Process('init')
  async handleInit(job: Job) {
    const dto = job.data;
    const topicId = await this.getStatusTopicId(dto.policyId);
    const payload = { type: 'PolicyStatusInit', ...dto };
    const res = (this.smartNode as any).submitMessageToTopic
      ? await (this.smartNode as any).submitMessageToTopic(topicId, payload)
      : await (this.smartNode as any).publishMessage?.(topicId, payload);
    await this.model.append(dto.policyId, 'init', dto, res.consensusTimestamp);
    return { consensusTimestamp: res.consensusTimestamp };
  }

  @Process('update')
  async handleUpdate(job: Job) {
    const dto = job.data;
    const topicId = await this.getStatusTopicId(dto.policyId);
    const payload = { type: 'PolicyStatusUpdate', ...dto };
    const res = (this.smartNode as any).submitMessageToTopic
      ? await (this.smartNode as any).submitMessageToTopic(topicId, payload)
      : await (this.smartNode as any).publishMessage?.(topicId, payload);
    await this.model.append(dto.policyId, 'update', dto, res.consensusTimestamp);
    return { consensusTimestamp: res.consensusTimestamp };
  }

  @Process('billing-due')
  async handleDue(job: Job) {
    const dto = job.data;
    const topicId = await this.getStatusTopicId(dto.policyId);
    const payload = { type: 'PremiumDue', ...dto };
    const res = (this.smartNode as any).submitMessageToTopic
      ? await (this.smartNode as any).submitMessageToTopic(topicId, payload)
      : await (this.smartNode as any).publishMessage?.(topicId, payload);
    await this.model.append(dto.policyId, 'billing-due', dto, res.consensusTimestamp);
    return { consensusTimestamp: res.consensusTimestamp };
  }

  @Process('billing-paid')
  async handlePaid(job: Job) {
    const dto = job.data;
    const topicId = await this.getStatusTopicId(dto.policyId);
    const payload = { type: 'PremiumPaid', ...dto };
    const res = (this.smartNode as any).submitMessageToTopic
      ? await (this.smartNode as any).submitMessageToTopic(topicId, payload)
      : await (this.smartNode as any).publishMessage?.(topicId, payload);
    await this.model.append(dto.policyId, 'billing-paid', dto, res.consensusTimestamp);
    return { consensusTimestamp: res.consensusTimestamp };
  }

  @Process('billing-missed')
  async handleMissed(job: Job) {
    const dto = job.data;
    const topicId = await this.getStatusTopicId(dto.policyId);
    const payload = { type: 'PremiumMissed', ...dto };
    const res = (this.smartNode as any).submitMessageToTopic
      ? await (this.smartNode as any).submitMessageToTopic(topicId, payload)
      : await (this.smartNode as any).publishMessage?.(topicId, payload);
    await this.model.append(dto.policyId, 'billing-missed', dto, res.consensusTimestamp);
    return { consensusTimestamp: res.consensusTimestamp };
  }
}


