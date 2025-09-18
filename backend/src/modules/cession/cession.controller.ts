import { Body, Controller, Post } from '@nestjs/common';
import { CessionService } from './cession.service';
import { CessionFundedDto, CessionRequestedDto } from './dto/cession.dtos';

@Controller('cession')
export class CessionController {
  constructor(private readonly service: CessionService) {}

  @Post('cession/request') async request(@Body() dto: CessionRequestedDto) { const job = await this.service.enqueueRequested(dto); return { jobId: job.id }; }
  @Post('cession/funded') async funded(@Body() dto: CessionFundedDto) { const job = await this.service.enqueueFunded(dto); return { jobId: job.id }; }
}


