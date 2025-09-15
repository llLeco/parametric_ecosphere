import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PolicyDocument = HydratedDocument<Policy>;

@Schema({ collection: 'policies', timestamps: true })
export class Policy {
  @Prop({ required: true, unique: true })
  policyId: string;

  @Prop({ required: true })
  beneficiary: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  sumInsured: number;

  @Prop({ required: true })
  premium: number;

  @Prop({ required: true })
  retention: number;

  @Prop({ type: Object, required: true })
  validity: { from: string; to: string };

  @Prop({ type: Object, required: true })
  ruleRef: { topicId: string; ts: string };

  @Prop({ required: true })
  payoutsTopicId: string;

  @Prop({ required: true })
  statusTopicId: string;

  @Prop()
  registryConsensusTimestamp?: string;
}

export const PolicySchema = SchemaFactory.createForClass(Policy);


