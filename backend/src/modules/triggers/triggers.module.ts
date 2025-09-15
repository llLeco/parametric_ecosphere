import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TriggersController } from './controller/triggers.controller';
import { TriggersService } from './service/triggers.service';
import { TriggersProcessor } from './consumer/triggers.processor';
import { TriggersModelModule } from './model/triggers.model.module';
import { INS_TRIGGERS_QUEUE } from '../../common/bull/queues';
import { SmartNodeCommonModule } from '../smartnode-common.module';
import { RolesGuard } from '../../common/security/roles.guard';
import { ConfigTopicsService } from '../../common/config/config-topics.service';
import { ConfigModelModule } from '../../common/config/config-model.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: INS_TRIGGERS_QUEUE }),
    TriggersModelModule,
    SmartNodeCommonModule,
    ConfigModelModule,
  ],
  controllers: [TriggersController],
  providers: [TriggersService, TriggersProcessor, RolesGuard, ConfigTopicsService],
  exports: [TriggersService],
})
export class TriggersModule {}


