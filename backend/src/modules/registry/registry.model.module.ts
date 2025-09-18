import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Policy, PolicySchema } from './entities/policy.entity';
import { RegistryModelService } from './registry.model.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Policy.name, schema: PolicySchema }])],
  providers: [RegistryModelService],
  exports: [RegistryModelService],
})
export class RegistryModelModule {}


