import { Body, Controller, Post } from '@nestjs/common';
import { PolicyStatusService } from './policy-status.service';
import { InitStatusDto, PremiumDueDto, PremiumMissedDto, PremiumPaidDto, UpdateStatusDto } from './dto/status.dtos';

@Controller('policy-status')
export class PolicyStatusController {
  constructor(private readonly service: PolicyStatusService) {}

  @Post('status/init')
  async init(@Body() dto: InitStatusDto) { const job = await this.service.enqueueInit(dto); return { jobId: job.id }; }

  @Post('status/update')
  async update(@Body() dto: UpdateStatusDto) { const job = await this.service.enqueueUpdate(dto); return { jobId: job.id }; }

  @Post('billing/due')
  async due(@Body() dto: PremiumDueDto) { const job = await this.service.enqueueDue(dto); return { jobId: job.id }; }

  @Post('billing/paid')
  async paid(@Body() dto: PremiumPaidDto) { const job = await this.service.enqueuePaid(dto); return { jobId: job.id }; }

  @Post('billing/missed')
  async missed(@Body() dto: PremiumMissedDto) { const job = await this.service.enqueueMissed(dto); return { jobId: job.id }; }
}


