import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { INS_CESSION_QUEUE } from '../../../common/bull/queues';
import { CessionFundedDto, CessionRequestedDto } from '../dto/cession.dtos';

@Injectable()
export class CessionService {
  constructor(@InjectQueue(INS_CESSION_QUEUE) private readonly cessionQueue: Queue) {}

  async enqueueRequested(dto: CessionRequestedDto) { return this.cessionQueue.add('requested', dto, { removeOnComplete: true }); }
  async enqueueFunded(dto: CessionFundedDto) { return this.cessionQueue.add('funded', dto, { removeOnComplete: true }); }
}


