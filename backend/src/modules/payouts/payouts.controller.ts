import { Body, Controller, Param, Post } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { PayoutExecutedDto, StopLossBreachedDto } from './dto/payouts.dtos';

@Controller('payouts')
export class PayoutsController {
  constructor(private readonly service: PayoutsService) {}

  @Post(':policyId/execute')
  async execute(@Param('policyId') policyId: string, @Body() dto: Omit<PayoutExecutedDto,'policyId'>) {
    const job = await this.service.enqueueExecuted({ ...dto, policyId });
    return { jobId: job.id };
  }

  @Post(':policyId/stop-loss')
  async stopLoss(@Param('policyId') policyId: string, @Body() dto: Omit<StopLossBreachedDto,'policyId'>) {
    const job = await this.service.enqueueStopLoss({ ...dto, policyId });
    return { jobId: job.id };
  }
}


