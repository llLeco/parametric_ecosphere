import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TriggerDocument = HydratedDocument<Trigger>;

@Schema({ collection: 'triggers', timestamps: true })
export class Trigger {
  @Prop({ required: true })
  policyId: string;

  @Prop({ type: Object, required: true })
  index: Record<string, number>;

  @Prop({ type: Object, required: true })
  window: { from: string; to: string };

  @Prop({ type: Object, required: true })
  ruleRef: { ts: string; topicId?: string };

  @Prop()
  trigTs?: string;
}

export const TriggerSchema = SchemaFactory.createForClass(Trigger);


