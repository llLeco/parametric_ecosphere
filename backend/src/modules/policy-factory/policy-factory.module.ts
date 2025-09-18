import { Module } from '@nestjs/common';
import { PolicyFactoryController } from './policy-factory.controller';
import { PolicyFactoryService } from './policy-factory.service';
import { SmartNodeCommonModule } from '../smartnode-common.module';
import { RegistryModule } from '../registry/registry.module';

@Module({
  imports: [SmartNodeCommonModule, RegistryModule],
  controllers: [PolicyFactoryController],
  providers: [PolicyFactoryService],
  exports: [PolicyFactoryService],
})
export class PolicyFactoryModule {}


