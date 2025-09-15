import { IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DateRangeDto { @IsString() from: string; @IsString() to: string; }
class RuleRefDto { @IsString() topicId: string; @IsString() ts: string; }

export class CreatePolicyFactoryDto {
  @IsString() @IsNotEmpty() policyId: string;
  @IsString() @IsNotEmpty() beneficiary: string;
  @ValidateNested() @Type(() => DateRangeDto) validity: DateRangeDto;
  @ValidateNested() @Type(() => RuleRefDto) ruleRef: RuleRefDto;
  @IsString() @IsNotEmpty() location: string;
  @IsNumber() sumInsured: number;
  @IsNumber() premium: number;
  @IsNumber() retention: number;
}


