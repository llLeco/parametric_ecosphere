import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TriggersService } from '../service/triggers.service';
import { TriggerEventDto } from '../dto/trigger-event.dto';
import { Roles, RolesGuard } from '../../../common/security/roles.guard';

@Controller('triggers')
@UseGuards(RolesGuard)
export class TriggersController {
  constructor(private readonly service: TriggersService) {}

  @Post()
  @Roles('oracle', 'admin')
  async postTrigger(@Body() dto: TriggerEventDto) {
    const job = await this.service.enqueueTriggerEvent(dto);
    return { jobId: job.id };
  }
}


