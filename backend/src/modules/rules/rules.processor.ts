import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { INS_RULES_QUEUE } from '../../common/bull/queues';
import { RulesModelService } from './rules.model.service';
import { SmartNodeCommonService } from '../smartnode-common.service';

// Load validator JSON lazily when needed
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rulesValidator = require('../config/rules.topic.validator.json');

@Processor(INS_RULES_QUEUE)
export class RulesProcessor {
  constructor(
    private readonly model: RulesModelService,
    private readonly smartNode: SmartNodeCommonService,
  ) {}

  @Process('create-rule')
  async handleCreateRule(job: Job) {
    const dto = job.data;
    // ensure validator exists and publish RuleCreated
    const addVal = this.smartNode.createValidator
      ? await (this.smartNode as any).createValidator(rulesValidator)
      : { consensusTimestamp: await (this.smartNode as any).addConsensusValidator?.(rulesValidator) };

    const cfg = await (this.smartNode as any).getConfig?.();
    if (!cfg?.rulesTopicId) throw new Error('rulesTopicId missing in config');

    const payload = { type: 'RuleCreated', ...dto, ruleRef: { ts: addVal.consensusTimestamp } };
    const res = (this.smartNode as any).submitMessageToTopic
      ? await (this.smartNode as any).submitMessageToTopic(cfg.rulesTopicId, payload)
      : await (this.smartNode as any).publishMessage?.(cfg.rulesTopicId, payload);

    await this.model.create({ ...dto, ruleRefTs: addVal.consensusTimestamp });

    return { consensusTimestamp: res.consensusTimestamp, ruleRef: { ts: addVal.consensusTimestamp } };
  }
}


