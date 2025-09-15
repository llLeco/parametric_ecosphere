import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { PayoutsService } from '../service/payouts.service';
import { PayoutExecutedDto, StopLossBreachedDto } from '../dto/payouts.dtos';
import { Roles, RolesGuard } from '../../../common/security/roles.guard';

@Controller('payouts')
@UseGuards(RolesGuard)
export class PayoutsController {
  constructor(private readonly service: PayoutsService) {}

  @Post(':policyId/execute')
  @Roles('admin')
  async execute(@Param('policyId') policyId: string, @Body() dto: Omit<PayoutExecutedDto,'policyId'>) {
    const job = await this.service.enqueueExecuted({ ...dto, policyId });
    return { jobId: job.id };
  }

  @Post(':policyId/stop-loss')
  @Roles('admin')
  async stopLoss(@Param('policyId') policyId: string, @Body() dto: Omit<StopLossBreachedDto,'policyId'>) {
    const job = await this.service.enqueueStopLoss({ ...dto, policyId });
    return { jobId: job.id };
  }
}


