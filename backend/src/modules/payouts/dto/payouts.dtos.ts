import { IsIn, IsNumber, IsOptional, IsString, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class RefDto {
  @IsString() topicId: string;
  @IsString() ts: string;
}

export class PayoutExecutedDto {
  @IsString() policyId: string;
  @IsString() beneficiary: string;
  @IsNumber() amount: number;
  @IsIn(['POOL','CESSION']) source: 'POOL'|'CESSION';
  @ValidateNested() @Type(() => RefDto) triggerRef: RefDto;
  @ValidateNested() @Type(() => RefDto) ruleRef: RefDto;
  @IsOptional() @ValidateNested() @Type(() => RefDto) sourceRef?: RefDto;
  @IsOptional() @ValidateNested() @Type(() => RefDto) statusRef?: RefDto;
  @IsOptional() @IsString() txId?: string;
}

export class StopLossBreachedDto {
  @IsString() policyId: string;
  @IsNumber() lossCum: number;
  @IsNumber() retention: number;
  @ValidateNested() @Type(() => RefDto) triggerRef: RefDto;
  @ValidateNested() @Type(() => RefDto) ruleRef: RefDto;
}


