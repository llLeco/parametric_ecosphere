import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CessionRequestedDto {
  @IsString() policyId: string;
  @IsNumber() excessAmount: number;
  @IsString() triggerRef: string;
  @IsString() ruleRef: string;
  @IsNumber() lossCum: number;
  @IsNumber() retention: number;
}

export class CessionFundedDto {
  @IsString() policyId: string;
  @IsNumber() amount: number;
  @IsString() reinsurer: string;
  @IsString() txId: string;
  @IsString() ruleRef: string;
  @IsOptional() @IsString() cessionRef?: string;
}


