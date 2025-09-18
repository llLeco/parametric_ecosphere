import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Trigger, TriggerSchema } from './entities/trigger.entity';
import { TriggersModelService } from './triggers.model.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Trigger.name, schema: TriggerSchema }])],
  providers: [TriggersModelService],
  exports: [TriggersModelService],
})
export class TriggersModelModule {}


