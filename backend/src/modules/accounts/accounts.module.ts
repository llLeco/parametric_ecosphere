import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

/**
 * @class AccountsModule
 * @description Module for managing Hedera account operations
 * 
 * This module provides a comprehensive solution for interacting with Hedera accounts,
 * including account creation, key management, balance queries, and HBAR transfers.
 * It encapsulates all account-related functionality in a modular, reusable package
 * that can be easily integrated into any NestJS application.
 * 
 * Key features:
 * - Account creation with customizable key configurations
 * - Balance checking and transaction history retrieval
 * - Secure HBAR transfers between accounts
 * - Treasury account management for token operations
 * - Integration with Hedera's account staking functionality
 * 
 * The module integrates with the SmartNodeSdkService for Hedera network operations
 * and implements comprehensive error handling, logging, and transaction receipt validation.
 * 
 * @example
 * ```typescript
 * // Example usage in a NestJS application
 * @Module({
 *   imports: [
 *     AccountsModule,
 *     // Other modules...
 *   ],
 *   controllers: [AppController],
 *   providers: [AppService]
 * })
 * export class AppModule {}
 * ```
 * 
 * @example
 * ```typescript
 * // Example of injecting and using the AccountsService
 * constructor(private accountsService: AccountsService) {}
 * 
 * async createNewAccount() {
 *   const newAccount = await this.accountsService.createAccount({
 *     initialBalance: 10, // HBAR
 *     maxAutomaticTokenAssociations: 5
 *   });
 *   return newAccount;
 * }
 * ```
 * 
 * @see AccountsController - Handles HTTP requests for account operations
 * @see AccountsService - Implements business logic for account management
 * @see SmartNodeSdkService - Provides low-level Hedera network interaction
 * @since 1.0.0
 */
@Module({
  imports: [],
  controllers: [
    AccountsController
  ],
  providers: [
    AccountsService
  ],
  exports: [
    AccountsService
  ]
})
export class AccountsModule {} 