import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PolicyStatusHistory, PolicyStatusSchema } from './entities/policy-status.entity';
import { PolicyStatusModelService } from './policy-status.model.service';
import { Policy, PolicySchema } from '../registry/entities/policy.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PolicyStatusHistory.name, schema: PolicyStatusSchema },
      { name: Policy.name, schema: PolicySchema },
    ]),
  ],
  providers: [PolicyStatusModelService],
  exports: [PolicyStatusModelService],
})
export class PolicyStatusModelModule {}


