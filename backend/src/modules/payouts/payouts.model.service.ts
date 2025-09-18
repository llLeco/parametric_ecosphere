import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payout, PayoutDocument } from './entities/payout.entity';
import { Policy, PolicyDocument } from '../registry/entities/policy.entity';

@Injectable()
export class PayoutsModelService {
  constructor(
    @InjectModel(Payout.name) private readonly payoutModel: Model<PayoutDocument>,
    @InjectModel(Policy.name) private readonly policyModel: Model<PolicyDocument>,
  ) {}

  async create(p: Partial<Payout>) { return this.payoutModel.create(p); }
  async findPolicy(policyId: string) { return this.policyModel.findOne({ policyId }).exec(); }
}


