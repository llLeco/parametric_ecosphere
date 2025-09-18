import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PoolEventsController } from './pool-events.controller';
import { PoolEventsService } from './pool-events.service';
import { PoolEventsProcessor } from './pool-events.processor';
import { PoolEventsModelModule } from './pool-events.model.module';
import { INS_POOL_EVENTS_QUEUE } from '../../common/bull/queues';
import { SmartNodeCommonModule } from '../smartnode-common.module';
import { ConfigTopicsService } from '../../common/config/config-topics.service';
import { ConfigModelModule } from '../../common/config/config-model.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: INS_POOL_EVENTS_QUEUE }),
    PoolEventsModelModule,
    SmartNodeCommonModule,
    ConfigModelModule,
  ],
  controllers: [PoolEventsController],
  providers: [PoolEventsService, PoolEventsProcessor, ConfigTopicsService],
  exports: [PoolEventsService],
})
export class PoolEventsModule {}


