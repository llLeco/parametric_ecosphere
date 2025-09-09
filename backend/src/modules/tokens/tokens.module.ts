import { Module } from '@nestjs/common';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';

/**
 * @class TokensModule
 * @description Module for managing Hedera Token Service (HTS) operations
 * 
 * This module provides a comprehensive solution for interacting with the Hedera Token Service (HTS),
 * enabling developers to easily implement token-related functionality in their applications.
 * 
 * ## Features
 * - Fungible token creation with customizable properties
 * - Non-fungible token (NFT) creation and management
 * - Token minting and supply management
 * - Token information retrieval and querying
 * - Token transfer operations
 * - Token freeze/unfreeze capabilities
 * - KYC management for tokens
 * 
 * ## Architecture
 * The module follows a clean architecture pattern with:
 * - Controller layer: Handling HTTP requests and responses
 * - Service layer: Implementing business logic and Hedera interactions
 * - Integration with SmartNodeSdkService for secure Hedera network operations
 * 
 * ## Error Handling
 * Implements comprehensive error handling with detailed error messages and
 * appropriate HTTP status codes for all token operations.
 * 
 * ## Logging
 * Provides detailed logging of all token operations for debugging and audit purposes.
 * 
 * @example
 * ```typescript
 * // Example usage in a NestJS application
 * @Module({
 *   imports: [TokensModule],
 *   controllers: [AppController],
 *   providers: [AppService]
 * })
 * export class AppModule {}
 * ```
 * 
 * @see TokensController - Handles HTTP endpoints for token operations
 * @see TokensService - Implements token business logic and Hedera interactions
 * @see SmartNodeSdkService - Provides core Hedera network connectivity
 * @see IHashgraph.ILedger.IHTS - Interface definitions for token operations
 */
@Module({
  imports: [],
  controllers: [
    TokensController
  ],
  providers: [
    TokensService
  ],
  exports: [
    TokensService
  ]
})
export class TokensModule {} 