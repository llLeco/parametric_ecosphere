import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PayoutDocument = HydratedDocument<Payout>;

@Schema({ collection: 'payouts', timestamps: true })
export class Payout {
  @Prop({ required: true }) policyId: string;
  @Prop({ required: true }) beneficiary: string;
  @Prop({ required: true }) amount: number;
  @Prop({ required: true }) source: 'POOL' | 'CESSION';
  @Prop() triggerRef?: string;
  @Prop() ruleRef?: string;
  @Prop() sourceRef?: string;
  @Prop() statusRef?: string;
  @Prop() txId?: string;
  @Prop() msgTs?: string;
}

export const PayoutSchema = SchemaFactory.createForClass(Payout);


