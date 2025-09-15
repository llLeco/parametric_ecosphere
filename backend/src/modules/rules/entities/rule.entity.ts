import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RuleDocument = HydratedDocument<Rule>;

@Schema({ collection: 'rules', timestamps: true })
export class Rule {
  @Prop({ required: true, unique: true })
  ruleId: string;

  @Prop({ type: Object, required: true })
  indexDef: any;

  @Prop({ type: Object, required: true })
  payout: any;

  @Prop({ type: Object, required: true })
  validity: any;

  @Prop()
  policyScope?: string;

  @Prop()
  ruleRefTs?: string;
}

export const RuleSchema = SchemaFactory.createForClass(Rule);


