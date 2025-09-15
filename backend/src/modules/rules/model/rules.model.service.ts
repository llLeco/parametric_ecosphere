import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rule, RuleDocument } from '../entities/rule.entity';

@Injectable()
export class RulesModelService {
  constructor(@InjectModel(Rule.name) private readonly ruleModel: Model<RuleDocument>) {}

  async create(rule: Partial<Rule>): Promise<Rule> {
    return this.ruleModel.create(rule);
  }
}


