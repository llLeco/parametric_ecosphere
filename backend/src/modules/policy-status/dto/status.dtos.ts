import { IsIn, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ValidityDto {
  @IsString() from: string;
  @IsString() to: string;
}

class RuleRefDto {
  @IsString() topicId: string;
  @IsString() ts: string;
}

export class InitStatusDto {
  @IsString() @IsNotEmpty() policyId: string;
  @ValidateNested() @Type(() => ValidityDto) validity: ValidityDto;
  @ValidateNested() @Type(() => RuleRefDto) ruleRef: RuleRefDto;
  @IsString() @IsNotEmpty() beneficiary: string;
}

export class UpdateStatusDto {
  @IsString() @IsNotEmpty() policyId: string;
  @IsIn(['ACTIVE','SUSPENDED','CANCELLED','EXPIRED']) status: 'ACTIVE'|'SUSPENDED'|'CANCELLED'|'EXPIRED';
  @IsOptional() @IsString() reason?: string;
  @IsString() effectiveAt: string;
}

export class PremiumDueDto { @IsString() policyId: string; @IsNumber() amount: number; }
export class PremiumPaidDto { @IsString() policyId: string; @IsNumber() amount: number; @IsString() txId: string; }
export class PremiumMissedDto { @IsString() policyId: string; @IsNumber() amount: number; }


