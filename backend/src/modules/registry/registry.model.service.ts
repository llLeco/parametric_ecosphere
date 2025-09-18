import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Policy, PolicyDocument } from './entities/policy.entity';

@Injectable()
export class RegistryModelService {
  constructor(@InjectModel(Policy.name) private readonly policyModel: Model<PolicyDocument>) {}

  async create(policy: Partial<Policy>): Promise<Policy> {
    return this.policyModel.create(policy);
  }

  async findById(policyId: string): Promise<Policy | null> {
    return this.policyModel.findOne({ policyId }).exec();
  }

  async find(filters: Partial<Policy> = {}): Promise<Policy[]> {
    return this.policyModel.find(filters as any).exec();
  }

  async updateConsensusTimestamp(policyId: string, consensusTimestamp: string): Promise<void> {
    await this.policyModel.updateOne({ policyId }, { $set: { registryConsensusTimestamp: consensusTimestamp } }).exec();
  }
}


