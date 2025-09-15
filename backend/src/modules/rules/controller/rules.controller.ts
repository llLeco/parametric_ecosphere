import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RulesService } from '../service/rules.service';
import { CreateRuleDto } from '../dto/create-rule.dto';
import { Roles, RolesGuard } from '../../../common/security/roles.guard';

@Controller('rules')
@UseGuards(RolesGuard)
export class RulesController {
  constructor(private readonly service: RulesService) {}

  @Post()
  @Roles('admin')
  async createRule(@Body() dto: CreateRuleDto) {
    const job = await this.service.enqueueCreateRule(dto);
    return { jobId: job.id };
  }
}


