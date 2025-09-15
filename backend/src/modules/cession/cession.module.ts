import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CessionController } from './controller/cession.controller';
import { CessionService } from './service/cession.service';
import { CessionProcessor } from './consumer/cession.processor';
import { CessionModelModule } from './model/cession.model.module';
import { INS_CESSION_QUEUE } from '../../common/bull/queues';
import { SmartNodeCommonModule } from '../smartnode-common.module';
import { RolesGuard } from '../../common/security/roles.guard';
import { ConfigTopicsService } from '../../common/config/config-topics.service';
import { ConfigModelModule } from '../../common/config/config-model.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: INS_CESSION_QUEUE }),
    CessionModelModule,
    SmartNodeCommonModule,
    ConfigModelModule,
  ],
  controllers: [CessionController],
  providers: [CessionService, CessionProcessor, RolesGuard, ConfigTopicsService],
  exports: [CessionService],
})
export class CessionModule {}


