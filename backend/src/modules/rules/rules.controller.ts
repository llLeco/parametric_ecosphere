import { Body, Controller, Post } from '@nestjs/common';
import { RulesService } from './rules.service';
import { CreateRuleDto } from './dto/create-rule.dto';

@Controller('rules')
export class RulesController {
  constructor(private readonly service: RulesService) {}

  @Post()
  async createRule(@Body() dto: CreateRuleDto) {
    const job = await this.service.enqueueCreateRule(dto);
    return { jobId: job.id };
  }
}


