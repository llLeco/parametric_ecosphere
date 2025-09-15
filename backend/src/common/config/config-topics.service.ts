import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Config, ConfigDocument } from '../../modules/config/entities/config.entity';

export interface EcosTopicsConfig {
  policyRegistryTopicId: string;
  rulesTopicId: string;
  triggersTopicId: string;
  poolEventsTopicId?: string;
  cessionTopicId?: string;
}

@Injectable()
export class ConfigTopicsService {
  constructor(@InjectModel(Config.name) private readonly configModel: Model<ConfigDocument>) {}

  async getTopics(): Promise<EcosTopicsConfig> {
    const cfg = await this.configModel.findOne().lean().exec();
    if (!cfg) {
      throw new Error('Config not found. Initialize ecosystem topics first.');
    }
    const anyCfg: any = cfg as any;
    return {
      policyRegistryTopicId: anyCfg.policyRegistryTopicId || anyCfg.dao_hcs,
      rulesTopicId: anyCfg.rulesTopicId,
      triggersTopicId: anyCfg.triggersTopicId,
      poolEventsTopicId: anyCfg.poolEventsTopicId,
      cessionTopicId: anyCfg.cessionTopicId,
    };
  }
}


