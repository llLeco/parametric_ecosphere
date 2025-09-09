import { Injectable, OnModuleInit } from '@nestjs/common';
import { SmartNodeSdkService } from '@hsuite/smartnode-sdk';
import { SmartConfigService } from '@hsuite/smart-config';
import { Transaction, PrivateKey, Client } from '@hashgraph/sdk';
import { LoggerHelper } from '@hsuite/helpers';
import { Hashgraph, IHashgraph } from '@hsuite/hashgraph-types';
import * as exampleAccountsValidator from './validators/example.accounts.validator.json';
import { ChainType, ILedger, SmartLedgersService } from '@hsuite/smart-ledgers';

/**
 * @class AccountsService
 * @description Service for managing Hedera account operations
 * 
 * This service provides core functionality for interacting with Hedera accounts,
 * including account creation, balance queries, and HBAR transfers. It leverages the
 * SmartNodeSdkService for Hedera network operations and implements proper error handling
 * and logging.
 * 
 * @example
 * ```typescript
 * // Example usage in a NestJS service
 * @Injectable()
 * class MyService {
 *   constructor(private readonly accountsService: AccountsService) {}
 * 
 *   async createAndFundAccount() {
 *     const accountId = await this.accountsService.createAccount(10);
 *     await this.accountsService.transferHbar(accountId, 50);
 *   }
 * }
 * ```
 * 
 * @see SmartNodeSdkService
 * @see LoggerHelper
 * @see smartLedgersService
 */
@Injectable()
export class AccountsService implements OnModuleInit {
  /**
   * Logger instance for service operations
   * @private
   */
  private readonly logger = new LoggerHelper(AccountsService.name);
  
  /**
   * Hedera client instance for network interactions
   * @private
   */
  private client: Client;
  
  /**
   * Operator credentials for transaction signing
   * @private
   */
  private operator: IHashgraph.IOperator;

  /**
   * Ledger instance for network operations
   * @private
   */
  private ledger: ILedger;

  /**
   * Creates an instance of the AccountsService
   * 
   * @param smartConfigService - Configuration service for network settings
   * @param smartNodeSdkService - SDK service for Hedera network operations
   * @param smartLedgersService - Smart Ledgers service for network operations
   * 
   * @throws {Error} If operator credentials cannot be retrieved
   */
  constructor(
    private readonly smartConfigService: SmartConfigService,
    private readonly smartNodeSdkService: SmartNodeSdkService,
    private readonly smartLedgersService: SmartLedgersService
  ) {
    this.operator = this.smartConfigService.getOperator();  
  }

  /**
   * Lifecycle hook that initializes the service when the module is loaded
   * 
   * @description
   * This method is called once the module has been initialized. It performs
   * the following tasks:
   * 1. Gets the configured blockchain chain from configuration
   * 2. Initializes the appropriate ledger with chain-specific settings
   * 3. Retrieves and stores the ledger instance for later use
   * 
   * @returns {Promise<void>} A promise that resolves when initialization is complete
   * 
   * @example
   * ```typescript
   * // This method is called automatically by NestJS
   * // No manual invocation is needed
   * ```
   */
    async onModuleInit() {
      this.ledger = this.smartLedgersService.getAdapter(ChainType.HASHGRAPH).getLedger();
      this.client = await this.ledger.getClient();
  }

  /**
   * Creates a new account on the Hedera network
   * 
   * @param {Omit<IHashgraph.ILedger.IAccounts.IRequest.ICreate, 'validatorConsensusTimestamp'>} params - Parameters for the account creation
   * 
   * @returns {Promise<string>} The ID of the created account
   * 
   * @throws {Error} If account creation fails due to:
   * - Network connectivity issues
   * - Invalid operator credentials
   * - Transaction execution failure
   * - Insufficient operator balance
   * 
   * @example
   * ```typescript
   * // Create an account with initial balance
   * const accountId = await accountsService.createAccount(10);
   * console.log(`Created account: ${accountId}`);
   * 
   * // Create an account with zero balance
   * const zeroBalanceAccountId = await accountsService.createAccount();
   * ```
   */
  async createAccount(
    params: Omit<IHashgraph.ILedger.IAccounts.IRequest.ICreate, 'validatorConsensusTimestamp'>
  ): Promise<string> {
    try {
      const validatorConsensusTimestamp = await this.smartNodeSdkService.sdk.smartNode.validators
        .addAccountValidator(exampleAccountsValidator as any);

      // Generate transaction bytes using the Smart Node SDK
      const createAccountTxBytes = await this.smartNodeSdkService.sdk.hashgraph.accounts.createAccount({
        ...params,
        validatorConsensusTimestamp
      });

      // Convert bytes to transaction object
      const createAccountTx = Transaction.fromBytes(
        new Uint8Array(Buffer.from(createAccountTxBytes))
      );
      
      // Sign the transaction with operator key
      const signedTx = await createAccountTx.sign(
        PrivateKey.fromString(this.operator.privateKey)
      );
      
      // Execute the transaction and get receipt
      const txResponse = await signedTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      
      // Return the new account details
      return(receipt.accountId.toString());
    } catch (error) {
      this.logger.error(`Failed to create account: ${error.message}`);
      throw error;
    }
  }

  /**
   * Transfers HBAR from the operator account to another account
   * 
   * @param {IHashgraph.ILedger.IAccounts.IRequest.ITransfer.IHbar} params - Parameters for the HBAR transfer
   * 
   * @returns {Promise<string>} The transaction ID of the transfer
   * 
   * @throws {Error} If transfer fails due to:
   * - Network connectivity issues
   * - Invalid operator credentials
   * - Transaction execution failure
   * - Insufficient operator balance
   * - Invalid recipient account
   * 
   * @example
   * ```typescript
   * // Transfer a specific amount
   * const txId = await accountsService.transferHbar('0.0.12345', 50);
   * console.log(`Transferred 50 HBAR, transaction: ${txId}`);
   * 
   * // Transfer a small amount
   * const smallTxId = await accountsService.transferHbar('0.0.12345', 0.1);
   * ```
   */
  async transferHbar(
    params: IHashgraph.ILedger.IAccounts.IRequest.ITransfer.IHbar
  ): Promise<string> {
    try {
      // Generate transaction bytes for HBAR transfer
      const transferTxBytes = await this.smartNodeSdkService.sdk.hashgraph.accounts.transferHbar(params);
      
      // Convert bytes to transaction object
      const transferTx = Transaction.fromBytes(
        new Uint8Array(Buffer.from(transferTxBytes))
      );
      
      // Sign transaction with operator key
      const signedTx = await transferTx.sign(
        PrivateKey.fromString(this.operator.privateKey)
      );
      
      // Execute transaction
      const txResponse = await signedTx.execute(this.client);
      
      // Return the transaction ID
      return txResponse.transactionId.toString();
    } catch (error) {
      this.logger.error(`Failed to transfer HBAR: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieves account information from the Hedera network
   * 
   * @param accountId - ID of the account to query
   * 
   * @returns {Promise<Hashgraph.Ledger.Accounts.Info>} Detailed information about the account
   * 
   * @throws {Error} If account information retrieval fails due to:
   * - Network connectivity issues
   * - Invalid account ID
   * - Account not found
   * 
   * @example
   * ```typescript
   * // Get basic account information
   * const accountInfo = await accountsService.getAccountInfo('0.0.12345');
   * console.log(`Account balance: ${accountInfo.balance.toString()} hbar`);
   * console.log(`Account key: ${accountInfo.key.key}`);
   * 
   * // Check account properties
   * if (accountInfo.isDeleted) {
   *   console.log('Account has been deleted');
   * }
   * if (accountInfo.memo) {
   *   console.log(`Account memo: ${accountInfo.memo}`);
   * }
   * ```
   */
  async getAccountInfo(accountId: string): Promise<Hashgraph.Ledger.Accounts.Info> {
    try {
      // Use the Smart Node SDK to query account information
      return await this.smartNodeSdkService.sdk.hashgraph.accounts.getInfo(accountId);
    } catch (error) {
      this.logger.error(`Failed to retrieve account info: ${error.message}`);
      throw error;
    }
  }

  /**
   * Queries the account balance
   * 
   * @param accountId - ID of the account to query
   * 
   * @returns {Promise<Hashgraph.AccountBalance>} The account's balance information
   * 
   * @throws {Error} If balance retrieval fails due to:
   * - Network connectivity issues
   * - Invalid account ID
   * - Account not found
   * 
   * @example
   * ```typescript
   * // Get account balance
   * const balance = await accountsService.getAccountBalance('0.0.12345');
   * console.log(`HBAR balance: ${balance.hbars.toString()}`);
   * 
   * // Check token balances
   * if (Object.keys(balance.tokens).length > 0) {
   *   console.log('Token balances:');
   *   Object.entries(balance.tokens).forEach(([tokenId, amount]) => {
   *     console.log(`- ${tokenId}: ${amount}`);
   *   });
   * }
   * ```
   */
  async getAccountBalance(accountId: string): Promise<Hashgraph.AccountBalance> {
    try {
      // Use the Smart Node SDK to query the account balance
      return await this.smartNodeSdkService.sdk.hashgraph.accounts.getQueryBalance(accountId);
    } catch (error) {
      this.logger.error(`Failed to retrieve account balance: ${error.message}`);
      throw error;
    }
  }
} 