import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RegistryService } from '../service/registry.service';
import { CreatePolicyDto } from '../dto/create-policy.dto';
import { RegistryModelService } from '../model/registry.model.service';
import { Roles, RolesGuard } from '../../../common/security/roles.guard';

@Controller('registry')
@UseGuards(RolesGuard)
export class RegistryController {
  constructor(
    private readonly service: RegistryService,
    private readonly model: RegistryModelService,
  ) {}

  @Post('policies')
  @Roles('admin')
  async createPolicy(@Body() dto: CreatePolicyDto) {
    const job = await this.service.enqueueCreatePolicy(dto);
    return { jobId: job.id };
  }

  @Get('policies/:id')
  async getPolicy(@Param('id') id: string) {
    const policy = await this.model.findById(id);
    return policy || {};
  }

  @Get('policies')
  async listPolicies(@Query() q: any) {
    const filters: any = {};
    if (q.beneficiary) filters.beneficiary = q.beneficiary;
    if (q.location) filters.location = q.location;
    return this.model.find(filters);
  }
}


