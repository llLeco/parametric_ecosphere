import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';
import { RegistryProcessor } from './registry.processor';
import { RegistryModelModule } from './registry.model.module';
import { INS_REGISTRY_QUEUE } from '../../common/bull/queues';
import { SmartNodeCommonModule } from '../smartnode-common.module';
import { ConfigTopicsService } from '../../common/config/config-topics.service';
import { ConfigModelModule } from '../../common/config/config-model.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: INS_REGISTRY_QUEUE }),
    RegistryModelModule,
    SmartNodeCommonModule,
    ConfigModelModule,
  ],
  controllers: [RegistryController],
  providers: [RegistryService, RegistryProcessor, ConfigTopicsService],
  exports: [RegistryService],
})
export class RegistryModule {}


