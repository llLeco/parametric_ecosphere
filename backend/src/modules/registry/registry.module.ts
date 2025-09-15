import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { RegistryController } from './controller/registry.controller';
import { RegistryService } from './service/registry.service';
import { RegistryProcessor } from './consumer/registry.processor';
import { RegistryModelModule } from './model/registry.model.module';
import { INS_REGISTRY_QUEUE } from '../../common/bull/queues';
import { SmartNodeCommonModule } from '../smartnode-common.module';
import { RolesGuard } from '../../common/security/roles.guard';
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
  providers: [RegistryService, RegistryProcessor, RolesGuard, ConfigTopicsService],
  exports: [RegistryService],
})
export class RegistryModule {}


