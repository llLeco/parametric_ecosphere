import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PolicyStatusHistory, PolicyStatusDocument } from './entities/policy-status.entity';
import { Policy, PolicyDocument } from '../registry/entities/policy.entity';

@Injectable()
export class PolicyStatusModelService {
  constructor(
    @InjectModel(PolicyStatusHistory.name) private readonly statusModel: Model<PolicyStatusDocument>,
    @InjectModel(Policy.name) private readonly policyModel: Model<PolicyDocument>,
  ) {}

  async append(policyId: string, type: string, payload: any, msgTs?: string) {
    return this.statusModel.create({ policyId, type, payload, msgTs });
  }

  async findPolicy(policyId: string): Promise<Policy | null> {
    return this.policyModel.findOne({ policyId }).exec();
  }
}


