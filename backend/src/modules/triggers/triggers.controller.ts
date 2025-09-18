import { Body, Controller, Post } from '@nestjs/common';
import { TriggersService } from './triggers.service';
import { TriggerEventDto } from './dto/trigger-event.dto';
@Controller('triggers')
export class TriggersController {
  constructor(private readonly service: TriggersService) {}

  @Post()
  async postTrigger(@Body() dto: TriggerEventDto) {
    const job = await this.service.enqueueTriggerEvent(dto);
    return { jobId: job.id };
  }
}


