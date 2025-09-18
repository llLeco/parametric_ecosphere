import { Body, Controller, Post } from '@nestjs/common';
import { PoolEventsService } from './pool-events.service';
import { DepositDto, NavSnapshotDto, PayoutDebitedDto, PremiumDto } from './dto/pool-events.dtos';

@Controller('pool-events')
export class PoolEventsController {
  constructor(private readonly service: PoolEventsService) {}

  @Post('pool/deposit') async deposit(@Body() dto: DepositDto) { const job = await this.service.enqueueDeposit(dto); return { jobId: job.id }; }
  @Post('pool/premium') async premium(@Body() dto: PremiumDto) { const job = await this.service.enqueuePremium(dto); return { jobId: job.id }; }
  @Post('pool/payout-debited') async payoutDebited(@Body() dto: PayoutDebitedDto) { const job = await this.service.enqueuePayoutDebited(dto); return { jobId: job.id }; }
  @Post('pool/nav') async nav(@Body() dto: NavSnapshotDto) { const job = await this.service.enqueueNav(dto); return { jobId: job.id }; }
}


