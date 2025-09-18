import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { INS_REGISTRY_QUEUE } from '../../common/bull/queues';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { SmartNodeCommonService } from '../smartnode-common.service';
import { ConfigTopicsService } from '../../common/config/config-topics.service';

@Injectable()
export class RegistryService {
  constructor(
    @InjectQueue(INS_REGISTRY_QUEUE) private readonly registryQueue: Queue,
    private readonly smartNode: SmartNodeCommonService,
    private readonly configTopics: ConfigTopicsService,
  ) {}

  async enqueueCreatePolicy(dto: CreatePolicyDto) {
    return this.registryQueue.add('create-policy', dto, { removeOnComplete: true, attempts: 3 });
  }

  async getConfigTopics() {
    // Adapter for getConfig: build from config module if not available
    // For now, rely on SmartNodeCommonService wrapper methods provided
    const config = (this.smartNode as any).getConfig ? await (this.smartNode as any).getConfig() : await this.configTopics.getTopics();
    if (config) return config;
    // Fallback: read from database config via environment is out of scope here
    throw new Error('Config with topic IDs is not available');
  }
}


