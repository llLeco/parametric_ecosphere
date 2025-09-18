import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PoolLedgerEntry, PoolLedgerEntryDocument } from './entities/pool-ledger-entry.entity';

@Injectable()
export class PoolEventsModelService {
  constructor(@InjectModel(PoolLedgerEntry.name) private readonly ledgerModel: Model<PoolLedgerEntryDocument>) {}

  async create(entry: Partial<PoolLedgerEntry>) { return this.ledgerModel.create(entry); }
}


