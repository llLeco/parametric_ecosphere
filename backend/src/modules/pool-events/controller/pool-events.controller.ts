import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PoolEventsService } from '../service/pool-events.service';
import { DepositDto, NavSnapshotDto, PayoutDebitedDto, PremiumDto } from '../dto/pool-events.dtos';
import { Roles, RolesGuard } from '../../../common/security/roles.guard';

@Controller('pool-events')
@UseGuards(RolesGuard)
export class PoolEventsController {
  constructor(private readonly service: PoolEventsService) {}

  @Post('pool/deposit') @Roles('admin','contributor') async deposit(@Body() dto: DepositDto) { const job = await this.service.enqueueDeposit(dto); return { jobId: job.id }; }
  @Post('pool/premium') @Roles('admin','contributor') async premium(@Body() dto: PremiumDto) { const job = await this.service.enqueuePremium(dto); return { jobId: job.id }; }
  @Post('pool/payout-debited') @Roles('admin') async payoutDebited(@Body() dto: PayoutDebitedDto) { const job = await this.service.enqueuePayoutDebited(dto); return { jobId: job.id }; }
  @Post('pool/nav') @Roles('admin') async nav(@Body() dto: NavSnapshotDto) { const job = await this.service.enqueueNav(dto); return { jobId: job.id }; }
}


