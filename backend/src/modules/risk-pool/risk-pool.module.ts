import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RiskPoolService } from './risk-pool.service';
import { RiskPoolController } from './risk-pool.controller';
import { RiskPool, RiskPoolSchema } from './schemas/risk-pool.schema';
import { PoolContribution, PoolContributionSchema } from './schemas/pool-contribution.schema';
import { LiquidityPosition, LiquidityPositionSchema } from './schemas/liquidity-position.schema';

/**
 * @class RiskPoolModule
 * @description Risk Pool management module for premium collection and liquidity management
 * 
 * This module handles:
 * - Risk pool creation and management
 * - Premium collection and pooling
 * - Liquidity management and monitoring
 * - Capital allocation and diversification
 * - Pool performance tracking and analytics
 * - Stop-loss mechanisms and risk controls
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RiskPool.name, schema: RiskPoolSchema },
      { name: PoolContribution.name, schema: PoolContributionSchema },
      { name: LiquidityPosition.name, schema: LiquidityPositionSchema }
    ])
  ],
  controllers: [RiskPoolController],
  providers: [RiskPoolService],
  exports: [RiskPoolService]
})
export class RiskPoolModule {}
