import { IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class WindowDto {
  @IsString() from: string;
  @IsString() to: string;
}

class RuleRefDto {
  @IsString() topicId: string;
  @IsString() ts: string;
}

export class TriggerEventDto {
  @IsString() @IsNotEmpty() policyId: string;
  @IsString() @IsNotEmpty() location: string;
  @IsObject() index: Record<string, number>;
  @ValidateNested() @Type(() => WindowDto) window: WindowDto;
  @ValidateNested() @Type(() => RuleRefDto) ruleRef: RuleRefDto;
  @IsString() @IsNotEmpty() oracleSig: string;
}


