import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { INS_RULES_QUEUE } from '../../../common/bull/queues';
import { CreateRuleDto } from '../dto/create-rule.dto';

@Injectable()
export class RulesService {
  constructor(@InjectQueue(INS_RULES_QUEUE) private readonly rulesQueue: Queue) {}

  async enqueueCreateRule(dto: CreateRuleDto) {
    return this.rulesQueue.add('create-rule', dto, { removeOnComplete: true, attempts: 3 });
  }
}


