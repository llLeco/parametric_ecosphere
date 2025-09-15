import { IsNumber, IsOptional, IsString } from 'class-validator';

export class DepositDto { @IsString() poolId: string; @IsNumber() amount: number; @IsString() currencyTokenId: string; @IsString() ref: string; }
export class PremiumDto { @IsString() poolId: string; @IsString() policyId: string; @IsNumber() amount: number; @IsString() currencyTokenId: string; @IsString() ref: string; }
export class PayoutDebitedDto { @IsString() poolId: string; @IsString() policyId: string; @IsNumber() amount: number; @IsString() currencyTokenId: string; @IsString() ref: string; }
export class NavSnapshotDto { @IsString() poolId: string; @IsNumber() nav: number; @IsString() currencyTokenId: string; @IsString() ref: string; }


