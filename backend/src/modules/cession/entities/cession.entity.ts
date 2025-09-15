import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CessionDocument = HydratedDocument<Cession>;

@Schema({ collection: 'cessions', timestamps: true })
export class Cession {
  @Prop({ required: true }) policyId: string;
  @Prop() excessAmount?: number;
  @Prop() triggerRef?: string;
  @Prop() ruleRef?: string;
  @Prop() lossCum?: number;
  @Prop() retention?: number;

  @Prop() amount?: number;
  @Prop() reinsurer?: string;
  @Prop() txId?: string;
  @Prop() cessionRef?: string;
  @Prop() msgTs?: string;
}

export const CessionSchema = SchemaFactory.createForClass(Cession);


