import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PoolLedgerEntryDocument = HydratedDocument<PoolLedgerEntry>;

@Schema({ collection: 'pool_ledger', timestamps: true })
export class PoolLedgerEntry {
  @Prop({ required: true }) type: string;
  @Prop({ required: true }) poolId: string;
  @Prop() policyId?: string;
  @Prop({ required: true }) amount: number;
  @Prop({ required: true }) currencyTokenId: string;
  @Prop({ type: Object }) balances?: { before: number; after: number };
  @Prop() ref?: string;
  @Prop() tsLocal?: string;
  @Prop() msgTs?: string;
}

export const PoolLedgerEntrySchema = SchemaFactory.createForClass(PoolLedgerEntry);


