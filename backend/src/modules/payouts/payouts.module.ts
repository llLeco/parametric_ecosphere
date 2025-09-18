import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PayoutsController } from './payouts.controller';
import { PayoutsService } from './payouts.service';
import { PayoutsProcessor } from './payouts.processor';
import { PayoutsModelModule } from './payouts.model.module';
import { INS_PAYOUTS_QUEUE } from '../../common/bull/queues';
import { SmartNodeCommonModule } from '../smartnode-common.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: INS_PAYOUTS_QUEUE }),
    PayoutsModelModule,
    SmartNodeCommonModule,
  ],
  controllers: [PayoutsController],
  providers: [PayoutsService, PayoutsProcessor],
  exports: [PayoutsService],
})
export class PayoutsModule {}


