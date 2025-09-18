import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TriggersController } from './triggers.controller';
import { TriggersService } from './triggers.service';
import { TriggersProcessor } from './triggers.processor';
import { TriggersModelModule } from './triggers.model.module';
import { INS_TRIGGERS_QUEUE } from '../../common/bull/queues';
import { SmartNodeCommonModule } from '../smartnode-common.module';
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
  providers: [TriggersService, TriggersProcessor, ConfigTopicsService],
  exports: [TriggersService],
})
export class TriggersModule {}


