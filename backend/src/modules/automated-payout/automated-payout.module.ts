import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutomatedPayoutService } from './automated-payout.service';
import { AutomatedPayoutController } from './automated-payout.controller';
import { PayoutTransaction, PayoutTransactionSchema } from './schemas/payout-transaction.schema';
import { LiquidityReservation, LiquidityReservationSchema } from './schemas/liquidity-reservation.schema';
import { BeneficiaryWallet, BeneficiaryWalletSchema } from './schemas/beneficiary-wallet.schema';

/**
 * @class AutomatedPayoutModule
 * @description Automated Payout System for parametric insurance claims
 * 
 * This module handles:
 * - Automated payout execution based on validated triggers
 * - HTS (Hedera Token Service) integration for token transfers
 * - Liquidity management and reservation
 * - Beneficiary wallet management and validation
 * - Transaction finality confirmation (>5k threshold)
 * - Payout failure handling and retry mechanisms
 * - Integration with risk pools for fund sourcing
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PayoutTransaction.name, schema: PayoutTransactionSchema },
      { name: LiquidityReservation.name, schema: LiquidityReservationSchema },
      { name: BeneficiaryWallet.name, schema: BeneficiaryWalletSchema }
    ])
  ],
  controllers: [AutomatedPayoutController],
  providers: [AutomatedPayoutService],
  exports: [AutomatedPayoutService]
})
export class AutomatedPayoutModule {}
