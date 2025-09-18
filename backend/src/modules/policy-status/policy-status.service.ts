import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { INS_POLICY_STATUS_QUEUE } from '../../common/bull/queues';
import { InitStatusDto, PremiumDueDto, PremiumMissedDto, PremiumPaidDto, UpdateStatusDto } from './dto/status.dtos';

@Injectable()
export class PolicyStatusService {
  constructor(@InjectQueue(INS_POLICY_STATUS_QUEUE) private readonly statusQueue: Queue) {}

  async enqueueInit(dto: InitStatusDto) { return this.statusQueue.add('init', dto, { removeOnComplete: true }); }
  async enqueueUpdate(dto: UpdateStatusDto) { return this.statusQueue.add('update', dto, { removeOnComplete: true }); }
  async enqueueDue(dto: PremiumDueDto) { return this.statusQueue.add('billing-due', dto, { removeOnComplete: true }); }
  async enqueuePaid(dto: PremiumPaidDto) { return this.statusQueue.add('billing-paid', dto, { removeOnComplete: true }); }
  async enqueueMissed(dto: PremiumMissedDto) { return this.statusQueue.add('billing-missed', dto, { removeOnComplete: true }); }
}


