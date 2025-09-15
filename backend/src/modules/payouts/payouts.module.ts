import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PayoutsController } from './controller/payouts.controller';
import { PayoutsService } from './service/payouts.service';
import { PayoutsProcessor } from './consumer/payouts.processor';
import { PayoutsModelModule } from './model/payouts.model.module';
import { INS_PAYOUTS_QUEUE } from '../../common/bull/queues';
import { SmartNodeCommonModule } from '../smartnode-common.module';
import { RolesGuard } from '../../common/security/roles.guard';

@Module({
  imports: [
    BullModule.registerQueue({ name: INS_PAYOUTS_QUEUE }),
    PayoutsModelModule,
    SmartNodeCommonModule,
  ],
  controllers: [PayoutsController],
  providers: [PayoutsService, PayoutsProcessor, RolesGuard],
  exports: [PayoutsService],
})
export class PayoutsModule {}


