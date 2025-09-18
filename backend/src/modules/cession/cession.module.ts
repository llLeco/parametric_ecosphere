import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CessionController } from './cession.controller';
import { CessionService } from './cession.service';
import { CessionProcessor } from './cession.processor';
import { CessionModelModule } from './cession.model.module';
import { INS_CESSION_QUEUE } from '../../common/bull/queues';
import { SmartNodeCommonModule } from '../smartnode-common.module';
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
  providers: [CessionService, CessionProcessor, ConfigTopicsService],
  exports: [CessionService],
})
export class CessionModule {}


