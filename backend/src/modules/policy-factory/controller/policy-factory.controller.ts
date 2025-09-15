import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PolicyFactoryService } from '../service/policy-factory.service';
import { CreatePolicyFactoryDto } from '../dto/create-policy-factory.dto';
import { Roles, RolesGuard } from '../../../common/security/roles.guard';

@Controller('policy-factory')
@UseGuards(RolesGuard)
export class PolicyFactoryController {
  constructor(private readonly service: PolicyFactoryService) {}

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreatePolicyFactoryDto) {
    return this.service.createPolicy(dto);
  }
}


