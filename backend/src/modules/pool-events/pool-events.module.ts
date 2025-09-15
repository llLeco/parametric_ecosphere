import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PoolEventsController } from './controller/pool-events.controller';
import { PoolEventsService } from './service/pool-events.service';
import { PoolEventsProcessor } from './consumer/pool-events.processor';
import { PoolEventsModelModule } from './model/pool-events.model.module';
import { INS_POOL_EVENTS_QUEUE } from '../../common/bull/queues';
import { SmartNodeCommonModule } from '../smartnode-common.module';
import { RolesGuard } from '../../common/security/roles.guard';
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
  providers: [PoolEventsService, PoolEventsProcessor, RolesGuard, ConfigTopicsService],
  exports: [PoolEventsService],
})
export class PoolEventsModule {}


