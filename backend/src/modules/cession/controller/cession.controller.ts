import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CessionService } from '../service/cession.service';
import { CessionFundedDto, CessionRequestedDto } from '../dto/cession.dtos';
import { Roles, RolesGuard } from '../../../common/security/roles.guard';

@Controller('cession')
@UseGuards(RolesGuard)
export class CessionController {
  constructor(private readonly service: CessionService) {}

  @Post('cession/request') @Roles('admin') async request(@Body() dto: CessionRequestedDto) { const job = await this.service.enqueueRequested(dto); return { jobId: job.id }; }
  @Post('cession/funded') @Roles('reinsurer') async funded(@Body() dto: CessionFundedDto) { const job = await this.service.enqueueFunded(dto); return { jobId: job.id }; }
}


