import { Body, Controller, Post } from '@nestjs/common';
import { PolicyFactoryService } from './policy-factory.service';
import { CreatePolicyFactoryDto } from './dto/create-policy-factory.dto';

@Controller('policy-factory')
export class PolicyFactoryController {
  constructor(private readonly service: PolicyFactoryService) {}

  @Post()
  async create(@Body() dto: CreatePolicyFactoryDto) {
    return this.service.createPolicy(dto);
  }
}


