import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class DateRangeDto {
  @IsNotEmpty()
  @IsString()
  from: string;

  @IsNotEmpty()
  @IsString()
  to: string;
}

class RuleRefDto {
  @IsNotEmpty()
  @IsString()
  topicId: string;

  @IsNotEmpty()
  @IsString()
  ts: string;
}

export class CreatePolicyDto {
  @IsString()
  @IsNotEmpty()
  policyId: string;

  @IsString()
  @IsNotEmpty()
  beneficiary: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNumber()
  sumInsured: number;

  @IsNumber()
  premium: number;

  @IsNumber()
  retention: number;

  @ValidateNested()
  @Type(() => DateRangeDto)
  validity: DateRangeDto;

  @ValidateNested()
  @Type(() => RuleRefDto)
  ruleRef: RuleRefDto;

  @IsString()
  @IsNotEmpty()
  payoutsTopicId: string;

  @IsString()
  @IsNotEmpty()
  statusTopicId: string;
}


