import { Module } from '@nestjs/common';
import { PolicyFactoryController } from './controller/policy-factory.controller';
import { PolicyFactoryService } from './service/policy-factory.service';
import { SmartNodeCommonModule } from '../smartnode-common.module';
import { RegistryModule } from '../registry/registry.module';
import { RolesGuard } from '../../common/security/roles.guard';

@Module({
  imports: [SmartNodeCommonModule, RegistryModule],
  controllers: [PolicyFactoryController],
  providers: [PolicyFactoryService, RolesGuard],
  exports: [PolicyFactoryService],
})
export class PolicyFactoryModule {}


