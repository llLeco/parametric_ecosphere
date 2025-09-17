import { Injectable } from '@nestjs/common';
import { RegistryService } from '../../registry/service/registry.service';
import { SmartNodeCommonService } from '../../smartnode-common.service';
import { CreatePolicyFactoryDto } from '../dto/create-policy-factory.dto';

// Use dynamic import path relative to compiled dist and ensure assets are copied by nest-cli.json
// eslint-disable-next-line @typescript-eslint/no-var-requires
const statusValidator = require('../../config/validators/policyStatus.topic.validator.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const payoutsValidator = require('../../config/validators/payouts.topic.validator.json');

@Injectable()
export class PolicyFactoryService {
  constructor(
    private readonly registry: RegistryService,
    private readonly smartNode: SmartNodeCommonService,
  ) {}

  async createPolicy(dto: CreatePolicyFactoryDto) {
    // a) create status topic
    const statusTopic = (this.smartNode as any).createTopicWithValidator
      ? await (this.smartNode as any).createTopicWithValidator(statusValidator)
      : { topicId: await (this.smartNode as any).createTopic?.(await (this.smartNode as any).addConsensusValidator?.(statusValidator)) };

    // b) create payouts topic
    const payoutsTopic = (this.smartNode as any).createTopicWithValidator
      ? await (this.smartNode as any).createTopicWithValidator(payoutsValidator)
      : { topicId: await (this.smartNode as any).createTopic?.(await (this.smartNode as any).addConsensusValidator?.(payoutsValidator)) };

    const statusTopicId: string = (statusTopic as any).topicId || (statusTopic as any);
    const payoutsTopicId: string = (payoutsTopic as any).topicId || (payoutsTopic as any);

    // c) publish PolicyStatusInit
    const initPayload = {
      type: 'PolicyStatusInit',
      policyId: dto.policyId,
      status: 'active',
      reason: 'Policy initialized',
      effectiveAt: dto.validity.from,
      period: 'monthly',
      amount: dto.premium,
      dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      paidAt: '',
      txId: `init_${Date.now()}`
    };
    const initRes = (this.smartNode as any).submitMessageToTopic
      ? await (this.smartNode as any).submitMessageToTopic(statusTopicId, initPayload)
      : await (this.smartNode as any).publishMessage?.(statusTopicId, initPayload);

    // d) enqueue registry create
    await this.registry.enqueueCreatePolicy({
      policyId: dto.policyId,
      beneficiary: dto.beneficiary,
      location: dto.location,
      sumInsured: dto.sumInsured,
      premium: dto.premium,
      retention: dto.retention,
      validity: dto.validity as any,
      ruleRef: dto.ruleRef as any,
      payoutsTopicId,
      statusTopicId,
    } as any);

    return { statusTopicId, payoutsTopicId, statusInitConsensusTimestamp: initRes.consensusTimestamp };
  }
}


