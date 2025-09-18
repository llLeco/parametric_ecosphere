import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { INS_POOL_EVENTS_QUEUE } from '../../common/bull/queues';
import { DepositDto, NavSnapshotDto, PayoutDebitedDto, PremiumDto } from './dto/pool-events.dtos';

@Injectable()
export class PoolEventsService {
  constructor(@InjectQueue(INS_POOL_EVENTS_QUEUE) private readonly poolQueue: Queue) {}

  async enqueueDeposit(dto: DepositDto) { return this.poolQueue.add('deposit', dto, { removeOnComplete: true }); }
  async enqueuePremium(dto: PremiumDto) { return this.poolQueue.add('premium', dto, { removeOnComplete: true }); }
  async enqueuePayoutDebited(dto: PayoutDebitedDto) { return this.poolQueue.add('payout-debited', dto, { removeOnComplete: true }); }
  async enqueueNav(dto: NavSnapshotDto) { return this.poolQueue.add('nav', dto, { removeOnComplete: true }); }
}


