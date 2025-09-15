import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class PayoutExecutedDto {
  @IsString() policyId: string;
  @IsString() beneficiary: string;
  @IsNumber() amount: number;
  @IsIn(['POOL','CESSION']) source: 'POOL'|'CESSION';
  @IsString() triggerRef: string;
  @IsString() ruleRef: string;
  @IsOptional() @IsString() sourceRef?: string;
  @IsOptional() @IsString() statusRef?: string;
  @IsOptional() @IsString() txId?: string;
}

export class StopLossBreachedDto {
  @IsString() policyId: string;
  @IsNumber() lossCum: number;
  @IsNumber() retention: number;
  @IsString() triggerRef: string;
  @IsString() ruleRef: string;
}


