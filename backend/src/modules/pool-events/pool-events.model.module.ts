import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PoolLedgerEntry, PoolLedgerEntrySchema } from './entities/pool-ledger-entry.entity';
import { PoolEventsModelService } from './pool-events.model.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: PoolLedgerEntry.name, schema: PoolLedgerEntrySchema }])],
  providers: [PoolEventsModelService],
  exports: [PoolEventsModelService],
})
export class PoolEventsModelModule {}


