import { Module } from '@nestjs/common';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';

/**
 * @class TopicsModule
 * @description Module for managing Hedera Consensus Service (HCS) operations
 * 
 * This module provides a complete solution for interacting with the Hedera Consensus Service,
 * including topic creation, message submission, and information retrieval. It integrates with
 * the SmartNodeSdkService for Hedera network operations and implements proper error handling
 * and logging.
 * 
 * @example
 * ```typescript
 * // Example usage in a NestJS application
 * @Module({
 *   imports: [TopicsModule],
 *   controllers: [AppController],
 *   providers: [AppService]
 * })
 * export class AppModule {}
 * ```
 * 
 * @see TopicsController
 * @see TopicsService
 * @see SmartNodeSdkService
 */
@Module({
  imports: [],
  controllers: [
    TopicsController
  ],
  providers: [
    TopicsService
  ],
  exports: [
    TopicsService
  ]
})
export class TopicsModule {} 