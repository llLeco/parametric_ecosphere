import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trigger, TriggerDocument } from '../entities/trigger.entity';

@Injectable()
export class TriggersModelService {
  constructor(@InjectModel(Trigger.name) private readonly triggerModel: Model<TriggerDocument>) {}

  async create(trigger: Partial<Trigger>): Promise<Trigger> {
    return this.triggerModel.create(trigger);
  }
}


