import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  BadRequestException 
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { Hashgraph, IHashgraph } from '@hsuite/hashgraph-types';
import { LoggerHelper } from '@hsuite/helpers';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBody, 
  ApiParam, 
  ApiOkResponse, 
  ApiBadRequestResponse, 
  ApiNotFoundResponse 
} from '@nestjs/swagger';

/**
 * Controller responsible for handling Hedera account-related operations.
 * 
 * This controller provides endpoints for demonstrating account functionality including:
 * - Creating new accounts on the Hedera network
 * - Transferring HBAR between accounts
 * - Retrieving account balances and detailed information
 * 
 * These endpoints serve as examples of how to integrate Hedera accounts with your applications
 * and demonstrate best practices for account management.
 *
 * @class AccountsController
 * @description Handles all Hedera account-related HTTP endpoints
 */
@ApiTags('Hedera Accounts')
@Controller('accounts')
export class AccountsController {
  private readonly logger: LoggerHelper = new LoggerHelper(AccountsController.name);

  /**
   * Creates an instance of AccountsController.
   * 
   * @param {AccountsService} accountsService - The service handling Hedera account operations
   * @constructor
   */
  constructor(private readonly accountsService: AccountsService) {}
  
  /**
   * Creates a new account on the Hedera network.
   * 
   * This endpoint allows for the creation of a new Hedera account with optional
   * initial balance. The account is created using the operator account credentials
   * configured in the application.
   * 
   * @param {IHashgraph.ILedger.IAccounts.IRequest.ICreate} params - Request body containing account creation parameters
   * @returns {Promise<string>} A promise resolving to the new account ID
   * @throws {BadRequestException} If account creation fails
   * 
   * @example
   * // Create account with 10 HBAR initial balance
   * POST /accounts/create
   * Body: { "initialBalance": 10 }
   */
  @ApiOperation({
    summary: 'Create a new Hedera account',
    description: 'Creates a new account on the Hedera network with optional initial balance'
  })
  @ApiBody({
    type: Hashgraph.Ledger.Accounts.Request.Create,
    required: true,
    description: 'Account creation parameters including optional initial balance'
  })
  @ApiOkResponse({
    type: String,
    description: 'The newly created account ID in the format 0.0.12345'
  })
  @ApiBadRequestResponse({
    description: 'Invalid account creation parameters or network error'
  })
  @Post('create')
  async createAccount(
    @Body() params: Omit<IHashgraph.ILedger.IAccounts.IRequest.ICreate, 'validatorConsensusTimestamp'>
  ): Promise<string> {
    try {
      return await this.accountsService.createAccount(params);
    } catch (error) {
      this.logger.error(`Failed to create account: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }
  
  /**
   * Transfers HBAR from the operator account to another account.
   * 
   * This endpoint facilitates the transfer of HBAR cryptocurrency between accounts.
   * The transfer is executed using the operator account as the source unless otherwise specified.
   * 
   * @param {IHashgraph.ILedger.IAccounts.IRequest.ITransfer.IHbar} params - Transfer parameters including recipient and amount
   * @returns {Promise<string>} A promise resolving to the transaction ID
   * @throws {BadRequestException} If HBAR transfer fails
   * 
   * @example
   * // Transfer 10 HBAR to account 0.0.12345
   * POST /accounts/transfer
   * Body: { "to": "0.0.12345", "amount": 10 }
   */
  @ApiOperation({
    summary: 'Transfer HBAR between accounts',
    description: 'Transfers HBAR cryptocurrency from the operator account to another specified account'
  })
  @ApiBody({
    type: Hashgraph.Ledger.Accounts.Request.Transfer.Hbar,
    required: true,
    description: 'HBAR transfer details including recipient account ID and amount'
  })
  @ApiOkResponse({
    type: String,
    description: 'Transaction ID of the completed transfer'
  })
  @ApiBadRequestResponse({
    description: 'Invalid transfer parameters, insufficient funds, or network error'
  })
  @Post('transfer')
  async transferHbar(
    @Body() params: IHashgraph.ILedger.IAccounts.IRequest.ITransfer.IHbar
  ): Promise<string> {
    try {
      return await this.accountsService.transferHbar(params);
    } catch (error) {
      this.logger.error(`Failed to transfer HBAR: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }
  
  /**
   * Retrieves detailed information about a specific Hedera account.
   * 
   * This endpoint queries the Hedera network for comprehensive information about
   * an account, including its balance, associated tokens, and other properties.
   * 
   * @param {string} accountId - The Hedera account ID to query
   * @returns {Promise<Hashgraph.Ledger.Accounts.Info>} A promise resolving to detailed account information
   * @throws {BadRequestException} If the account query fails
   * 
   * @example
   * // Get detailed information for account 0.0.12345
   * GET /accounts/0.0.12345/info
   */
  @ApiOperation({
    summary: 'Get account information',
    description: 'Retrieves detailed information about a specific Hedera account, including balance, associated tokens, and other account properties'
  })
  @ApiParam({
    name: 'accountId',
    type: String,
    required: true,
    description: 'The Hedera account ID in the format 0.0.12345'
  })
  @ApiOkResponse({
    type: Hashgraph.Ledger.Accounts.Info,
    description: 'Detailed account information including balance, associated tokens, and other properties'
  })
  @ApiNotFoundResponse({
    description: 'Account not found on the Hedera network'
  })
  @ApiBadRequestResponse({
    description: 'Invalid account ID format or network error'
  })
  @Get(':accountId/info')
  async getAccountInfo(
    @Param('accountId') accountId: string
  ): Promise<Hashgraph.Ledger.Accounts.Info> {
    try {
      return await this.accountsService.getAccountInfo(accountId);
    } catch (error) {
      this.logger.error(`Failed to get account info: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }
  
  /**
   * Retrieves the current balance of a Hedera account.
   * 
   * This endpoint queries the Hedera network for the current balance of an account,
   * including HBAR and any associated tokens.
   * 
   * @param {string} accountId - The Hedera account ID to query
   * @returns {Promise<Hashgraph.AccountBalance>} A promise resolving to the account balance
   * @throws {BadRequestException} If the balance query fails
   * 
   * @example
   * // Get balance for account 0.0.12345
   * GET /accounts/0.0.12345/balance
   */
  @ApiOperation({
    summary: 'Get account balance',
    description: 'Retrieves the current balance of a Hedera account, including HBAR and any associated tokens'
  })
  @ApiParam({
    name: 'accountId',
    type: String,
    required: true,
    description: 'The Hedera account ID in the format 0.0.12345'
  })
  @ApiOkResponse({
    type: Hashgraph.AccountBalance,
    description: 'Account balance information including HBAR and token balances'
  })
  @ApiNotFoundResponse({
    description: 'Account not found on the Hedera network'
  })
  @ApiBadRequestResponse({
    description: 'Invalid account ID format or network error'
  })
  @Get(':accountId/balance')
  async getAccountBalance(
    @Param('accountId') accountId: string
  ): Promise<Hashgraph.AccountBalance> {
    try {
      return await this.accountsService.getAccountBalance(accountId);
    } catch (error) {
      this.logger.error(`Failed to get account balance: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }
} 