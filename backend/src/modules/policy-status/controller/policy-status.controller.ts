import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PolicyStatusService } from '../service/policy-status.service';
import { InitStatusDto, PremiumDueDto, PremiumMissedDto, PremiumPaidDto, UpdateStatusDto } from '../dto/status.dtos';
import { Roles, RolesGuard } from '../../../common/security/roles.guard';

@Controller('policy-status')
@UseGuards(RolesGuard)
export class PolicyStatusController {
  constructor(private readonly service: PolicyStatusService) {}

  @Post('status/init')
  @Roles('admin')
  async init(@Body() dto: InitStatusDto) { const job = await this.service.enqueueInit(dto); return { jobId: job.id }; }

  @Post('status/update')
  @Roles('admin')
  async update(@Body() dto: UpdateStatusDto) { const job = await this.service.enqueueUpdate(dto); return { jobId: job.id }; }

  @Post('billing/due')
  @Roles('admin')
  async due(@Body() dto: PremiumDueDto) { const job = await this.service.enqueueDue(dto); return { jobId: job.id }; }

  @Post('billing/paid')
  @Roles('admin')
  async paid(@Body() dto: PremiumPaidDto) { const job = await this.service.enqueuePaid(dto); return { jobId: job.id }; }

  @Post('billing/missed')
  @Roles('admin')
  async missed(@Body() dto: PremiumMissedDto) { const job = await this.service.enqueueMissed(dto); return { jobId: job.id }; }
}


