import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PolicyStatusController } from './controller/policy-status.controller';
import { PolicyStatusService } from './service/policy-status.service';
import { PolicyStatusProcessor } from './consumer/policy-status.processor';
import { PolicyStatusModelModule } from './model/policy-status.model.module';
import { INS_POLICY_STATUS_QUEUE } from '../../common/bull/queues';
import { SmartNodeCommonModule } from '../smartnode-common.module';
import { RolesGuard } from '../../common/security/roles.guard';
import { ConfigTopicsService } from '../../common/config/config-topics.service';
import { ConfigModelModule } from '../../common/config/config-model.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: INS_POLICY_STATUS_QUEUE }),
    PolicyStatusModelModule,
    SmartNodeCommonModule,
    ConfigModelModule,
  ],
  controllers: [PolicyStatusController],
  providers: [PolicyStatusService, PolicyStatusProcessor, RolesGuard, ConfigTopicsService],
  exports: [PolicyStatusService],
})
export class PolicyStatusModule {}


