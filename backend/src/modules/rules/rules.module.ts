import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { RulesController } from './controller/rules.controller';
import { RulesService } from './service/rules.service';
import { RulesProcessor } from './consumer/rules.processor';
import { RulesModelModule } from './model/rules.model.module';
import { INS_RULES_QUEUE } from '../../common/bull/queues';
import { SmartNodeCommonModule } from '../smartnode-common.module';
import { RolesGuard } from '../../common/security/roles.guard';
import { ConfigTopicsService } from '../../common/config/config-topics.service';
import { ConfigModelModule } from '../../common/config/config-model.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: INS_RULES_QUEUE }),
    RulesModelModule,
    SmartNodeCommonModule,
    ConfigModelModule,
  ],
  controllers: [RulesController],
  providers: [RulesService, RulesProcessor, RolesGuard, ConfigTopicsService],
  exports: [RulesService],
})
export class RulesModule {}


