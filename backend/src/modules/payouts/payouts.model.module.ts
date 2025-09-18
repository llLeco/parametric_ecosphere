import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payout, PayoutSchema } from './entities/payout.entity';
import { PayoutsModelService } from './payouts.model.service';
import { Policy, PolicySchema } from '../registry/entities/policy.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Payout.name, schema: PayoutSchema }, { name: Policy.name, schema: PolicySchema }])],
  providers: [PayoutsModelService],
  exports: [PayoutsModelService],
})
export class PayoutsModelModule {}


