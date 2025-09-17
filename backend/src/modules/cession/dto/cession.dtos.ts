import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class RefDto {
  @IsString() topicId: string;
  @IsString() ts: string;
}

export class CessionRequestedDto {
  @IsString() policyId: string;
  @IsNumber() excessAmount: number;
  @ValidateNested() @Type(() => RefDto) triggerRef: RefDto;
  @ValidateNested() @Type(() => RefDto) ruleRef: RefDto;
  @IsNumber() lossCum: number;
  @IsNumber() retention: number;
}

export class CessionFundedDto {
  @IsString() policyId: string;
  @IsNumber() amount: number;
  @IsString() reinsurer: string;
  @IsString() txId: string;
  @ValidateNested() @Type(() => RefDto) ruleRef: RefDto;
  @IsOptional() @IsString() cessionRef?: string;
}


