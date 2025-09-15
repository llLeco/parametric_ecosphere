import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PolicyStatusDocument = HydratedDocument<PolicyStatusHistory>;

@Schema({ collection: 'policy_status_history', timestamps: true })
export class PolicyStatusHistory {
  @Prop({ required: true }) policyId: string;
  @Prop({ required: true }) type: string;
  @Prop({ type: Object, required: true }) payload: any;
  @Prop() msgTs?: string;
}

export const PolicyStatusSchema = SchemaFactory.createForClass(PolicyStatusHistory);


