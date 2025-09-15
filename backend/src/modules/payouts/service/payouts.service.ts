import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { INS_PAYOUTS_QUEUE } from '../../../common/bull/queues';
import { PayoutExecutedDto, StopLossBreachedDto } from '../dto/payouts.dtos';

@Injectable()
export class PayoutsService {
  constructor(@InjectQueue(INS_PAYOUTS_QUEUE) private readonly payoutsQueue: Queue) {}

  async enqueueExecuted(dto: PayoutExecutedDto) { return this.payoutsQueue.add('executed', dto, { removeOnComplete: true }); }
  async enqueueStopLoss(dto: StopLossBreachedDto) { return this.payoutsQueue.add('stop-loss', dto, { removeOnComplete: true }); }
}


