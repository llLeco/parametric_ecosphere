import { Controller, Get, Post, Body, Param, BadRequestException } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokenInfo } from '@hashgraph/sdk';
import { Hashgraph, IHashgraph } from '@hsuite/hashgraph-types';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { LoggerHelper } from '@hsuite/helpers';

/**
 * Controller for Hedera Token Service (HTS) operations
 * 
 * This controller provides endpoints for demonstrating HTS functionality:
 * - Creating fungible tokens
 * - Minting additional tokens
 * - Retrieving token information
 * - Managing token properties and permissions
 * 
 * Each endpoint is designed to showcase a specific aspect of the Hedera Token Service
 * and includes proper error handling, response formatting, and comprehensive documentation.
 * 
 * The controller leverages the TokensService to interact with the Hedera network
 * and perform token-related operations in a secure and efficient manner.
 * 
 * @example
 * // Example usage with a REST client
 * // Creating a fungible token
 * POST /tokens/create/fungible
 * {
 *   "name": "Example Token",
 *   "symbol": "EXT",
 *   "decimals": 2,
 *   "initialSupply": 1000,
 *   "treasuryAccountId": "0.0.12345"
 * }
 * 
 * // Minting additional tokens
 * POST /tokens/mint
 * {
 *   "tokenId": "0.0.12345",
 *   "amount": 500
 * }
 * 
 * // Getting token information
 * GET /tokens/0.0.12345/info
 * 
 * @class TokensController
 * @see TokensService
 * @see IHashgraph.ILedger.IHTS
 */
@ApiTags('tokens')
@Controller('tokens')
export class TokensController {
  private readonly logger: LoggerHelper = new LoggerHelper(TokensController.name);

  /**
   * Creates an instance of TokensController.
   * 
   * @param {TokensService} tokensService - The service handling Hedera token operations
   * @constructor
   */
  constructor(private readonly tokensService: TokensService) {}
  
  /**
   * Creates a new fungible token on the Hedera network
   * 
   * This endpoint demonstrates how to create a fungible token with customizable
   * properties including name, symbol, decimals, and initial supply. The treasury
   * account will receive the initial supply of tokens.
   * 
   * The token creation process involves:
   * 1. Validating the input parameters
   * 2. Creating the token on the Hedera network
   * 3. Returning the newly created token ID
   * 
   * @param {IHashgraph.ILedger.IHTS.ICreate} params - Request body containing token parameters
   * @returns {Promise<string>} The newly created token ID in the format 0.0.X
   * @throws {BadRequestException} If token creation fails due to invalid parameters or network issues
   * 
   * @example
   * // Create a basic fungible token
   * POST /tokens/create/fungible
   * {
   *   "name": "My Token",
   *   "symbol": "MTK",
   *   "decimals": 2,
   *   "initialSupply": 1000,
   *   "treasuryAccountId": "0.0.12345"
   * }
   * 
   * // Create a token with custom properties
   * POST /tokens/create/fungible
   * {
   *   "name": "Advanced Token",
   *   "symbol": "ADV",
   *   "decimals": 6,
   *   "initialSupply": 10000000,
   *   "treasuryAccountId": "0.0.12345",
   *   "adminKey": true,
   *   "kycKey": true,
   *   "freezeKey": true,
   *   "wipeKey": true,
   *   "supplyKey": true,
   *   "initialFreezeStatus": false
   * }
   */
  @Post('create/fungible')
  @ApiOperation({
    summary: 'Create a new fungible token',
    description: 'Creates a new fungible token on the Hedera network with customizable properties'
  })
  @ApiBody({
    type: Hashgraph.Ledger.HTS.Create,
    required: true,
    description: 'Token creation parameters including name, symbol, decimals, and initial supply'
  })
  @ApiOkResponse({
    type: String,
    description: 'The newly created token ID in the format 0.0.X'
  })
  @ApiBadRequestResponse({
    description: 'Invalid token parameters or network error'
  })
  async createToken(@Body() params: IHashgraph.ILedger.IHTS.ICreate): Promise<string> {
    try {
      return await this.tokensService.createToken(params);      
    } catch (error) {
      this.logger.error(`Failed to create fungible token: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }
  
  /**
   * Mints additional supply for a fungible token
   * 
   * This endpoint demonstrates how to increase the circulating supply of an
   * existing fungible token. The newly minted tokens are sent to the treasury account.
   * 
   * The minting process involves:
   * 1. Validating the token ID and amount
   * 2. Executing the mint transaction on the Hedera network
   * 3. Returning the transaction ID for the mint operation
   * 
   * Only accounts with the appropriate key permissions can mint additional tokens.
   * 
   * @param {IHashgraph.ILedger.IHTS.IFungibleToken.IMint} params - Request body containing token ID and amount to mint
   * @returns {Promise<string>} The transaction ID for the mint operation
   * @throws {BadRequestException} If minting fails due to invalid parameters, insufficient permissions, or network issues
   * 
   * @example
   * // Mint a small amount of tokens
   * POST /tokens/mint
   * {
   *   "tokenId": "0.0.12345",
   *   "amount": 500
   * }
   * 
   * // Mint a large amount of tokens
   * POST /tokens/mint
   * {
   *   "tokenId": "0.0.12345",
   *   "amount": 1000000
   * }
   * 
   * // Mint tokens with metadata
   * POST /tokens/mint
   * {
   *   "tokenId": "0.0.12345",
   *   "amount": 500,
   *   "metadata": "Additional supply for Q2 2023"
   * }
   */
  @Post('mint')
  @ApiOperation({
    summary: 'Mint additional tokens',
    description: 'Increases the circulating supply of an existing fungible token'
  })
  @ApiBody({
    type: Hashgraph.Ledger.HTS.FungibleToken.Mint,
    required: true,
    description: 'Token minting parameters including token ID and amount'
  })
  @ApiOkResponse({
    type: String,
    description: 'The transaction ID for the mint operation'
  })
  @ApiBadRequestResponse({
    description: 'Invalid token ID, amount, or insufficient permissions'
  })
  async mintTokens(
    @Body() params: IHashgraph.ILedger.IHTS.IFungibleToken.IMint
  ): Promise<string> {
    try {
      return await this.tokensService.mintFungibleTokens(params);
    } catch (error) {
      this.logger.error(`Failed to mint tokens: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }
  
  /**
   * Retrieves detailed information about a specific token
   * 
   * This endpoint demonstrates how to query the Hedera network for comprehensive
   * token information including supply, decimals, and associated keys.
   * 
   * The information retrieved includes:
   * - Basic token properties (name, symbol, decimals)
   * - Supply information (total, circulating)
   * - Treasury account
   * - Key information (admin, KYC, freeze, wipe, supply)
   * - Fee schedule
   * - Expiry information
   * 
   * @param {string} tokenId - ID of the token to query in the format 0.0.X
   * @returns {Promise<TokenInfo>} Detailed information about the token
   * @throws {BadRequestException} If the token query fails due to invalid token ID or network issues
   * 
   * @example
   * // Get information for a fungible token
   * GET /tokens/0.0.12345/info
   * 
   * // Get information for an NFT collection
   * GET /tokens/0.0.54321/info
   */
  @Get(':tokenId/info')
  @ApiOperation({
    summary: 'Get token information',
    description: 'Retrieves detailed information about a specific token on the Hedera network'
  })
  @ApiParam({
    name: 'tokenId',
    description: 'The ID of the token to query (format: 0.0.X)',
    type: 'string',
    example: '0.0.12345'
  })
  @ApiOkResponse({
    type: TokenInfo,
    description: 'Detailed token information including properties, supply, and associated keys'
  })
  @ApiBadRequestResponse({
    description: 'Invalid token ID format or token not found'
  })
  async getTokenInfo(@Param('tokenId') tokenId: string): Promise<TokenInfo> {
    try {
      return await this.tokensService.getTokenInfo(tokenId);
    } catch (error) {
      this.logger.error(`Failed to get token info: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }
} 