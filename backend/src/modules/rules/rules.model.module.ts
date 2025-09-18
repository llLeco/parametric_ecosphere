import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Rule, RuleSchema } from './entities/rule.entity';
import { RulesModelService } from './rules.model.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Rule.name, schema: RuleSchema }])],
  providers: [RulesModelService],
  exports: [RulesModelService],
})
export class RulesModelModule {}


