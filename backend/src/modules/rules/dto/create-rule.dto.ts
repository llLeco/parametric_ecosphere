import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class IndexDefDto {
  @IsString() metric: string;
  @IsString() operator: string;
  @IsNumber() threshold: number;
  @IsNumber() windowDays: number;
}

class PayoutDefDto {
  @IsNumber() amount: number;
  @IsString() currencyTokenId: string;
}

class ValidityDto {
  @IsString() from: string;
  @IsString() to: string;
}

export class CreateRuleDto {
  @IsString() @IsNotEmpty() ruleId: string;

  @ValidateNested() @Type(() => IndexDefDto) indexDef: IndexDefDto;
  @ValidateNested() @Type(() => PayoutDefDto) payout: PayoutDefDto;
  @ValidateNested() @Type(() => ValidityDto) validity: ValidityDto;
  @IsOptional() @IsString() policyScope?: string;
}


