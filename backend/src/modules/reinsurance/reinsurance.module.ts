import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReinsuranceService } from './reinsurance.service';
import { ReinsuranceController } from './reinsurance.controller';
import { ReinsurerContract, ReinsurerContractSchema } from './schemas/reinsurer-contract.schema';
import { CessionTransaction, CessionTransactionSchema } from './schemas/cession-transaction.schema';
import { ReinsuranceRecovery, ReinsuranceRecoverySchema } from './schemas/reinsurance-recovery.schema';
import { TreatyManagement, TreatyManagementSchema } from './schemas/treaty-management.schema';

/**
 * @class ReinsuranceModule
 * @description Reinsurance and Cession Management for risk transfer
 * 
 * This module handles:
 * - Automated cession to reinsurers for risk sharing
 * - Reinsurance treaty management (quota share, surplus, excess of loss)
 * - Recovery fund management and distribution
 * - Reinsurer wallet integration and payment processing
 * - Risk retention vs cession calculations
 * - Regulatory compliance for reinsurance transactions
 * - Performance monitoring and treaty optimization
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReinsurerContract.name, schema: ReinsurerContractSchema },
      { name: CessionTransaction.name, schema: CessionTransactionSchema },
      { name: ReinsuranceRecovery.name, schema: ReinsuranceRecoverySchema },
      { name: TreatyManagement.name, schema: TreatyManagementSchema }
    ])
  ],
  controllers: [ReinsuranceController],
  providers: [ReinsuranceService],
  exports: [ReinsuranceService]
})
export class ReinsuranceModule {}
