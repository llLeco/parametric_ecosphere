import { Injectable, OnModuleInit } from '@nestjs/common';
import { SmartNodeSdkService } from '@hsuite/smartnode-sdk';
import { SmartConfigService } from '@hsuite/smart-config';
import { Transaction, PrivateKey, Client, TokenInfo } from '@hashgraph/sdk';
import { LoggerHelper } from '@hsuite/helpers';
import { IHashgraph } from '@hsuite/hashgraph-types';
import * as exampleTokensValidator from './validators/example.tokens.validator.json';
import { ChainType, ILedger, SmartLedgersService } from '@hsuite/smart-ledgers';

/**
 * @class TokensService
 * @description Service for showcasing Hedera Token Service (HTS) operations
 * 
 * This service demonstrates how to use the SmartNodeSdkService to interact with
 * the Hedera Token Service for:
 * - Creating fungible tokens
 * - Creating non-fungible tokens (NFTs)
 * - Minting tokens and NFTs
 * - Transferring tokens between accounts
 * - Managing token properties and permissions
 * - Querying token information
 * 
 * Each method includes detailed documentation and example usage to help developers
 * understand how to implement token functionality in their own applications.
 * 
 * @example
 * ```typescript
 * // Inject the service
 * constructor(private tokensService: TokensService) {}
 * 
 * // Use the service to create and manage tokens
 * async createAndMintToken() {
 *   const tokenId = await this.tokensService.createToken({
 *     name: 'Example Token',
 *     symbol: 'EXT',
 *     decimals: 2,
 *     initialSupply: 1000
 *   });
 *   
 *   await this.tokensService.mintFungibleTokens({
 *     tokenId: tokenId,
 *     amount: 500
 *   });
 *   
 *   const tokenInfo = await this.tokensService.getTokenInfo(tokenId);
 *   return tokenInfo;
 * }
 * ```
 */
@Injectable()
export class TokensService implements OnModuleInit {
  /**
   * Logger instance for service operations
   * @private
   * @readonly
   */
  private readonly logger = new LoggerHelper(TokensService.name);
  
  /**
   * Hedera client instance for network interactions
   * @private
   */
  private client: Client;
  
  /**
   * Operator credentials for transaction signing
   * @private
   * @remarks Contains the account ID and private key used for signing transactions
   */
  private operator: IHashgraph.IOperator;

  /**
   * Ledger instance for network operations
   * @private
   */
  private ledger: ILedger;

  /**
   * Creates an instance of the TokensService
   * 
   * @param smartConfigService - Configuration service for network settings
   * @param smartNodeSdkService - SDK service for Hedera network operations
   * @param smartLedgersService - Smart Ledgers service for network operations
   * 
   * @example
   * ```typescript
   * // NestJS dependency injection will handle instantiation
   * @Module({
   *   providers: [TokensService],
   *   exports: [TokensService]
   * })
   * export class TokensModule {}
   * ```
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
   * Creates a new fungible token on the Hedera network
   * 
   * @param {Omit<IHashgraph.ILedger.IHTS.ICreate, 'validatorConsensusTimestamp'>} params - Token creation parameters including:
   *   - name: Token name
   *   - symbol: Token symbol (ticker)
   *   - decimals: Number of decimal places
   *   - initialSupply: Initial token supply
   *   - treasuryAccountId: (Optional) Account to receive initial supply
   *   - adminKey: (Optional) Key for token administration
   *   - kycKey: (Optional) Key for KYC verification
   *   - freezeKey: (Optional) Key for freezing token transfers
   *   - wipeKey: (Optional) Key for wiping tokens
   *   - supplyKey: (Optional) Key for minting/burning tokens
   *   - feeScheduleKey: (Optional) Key for updating fee schedule
   *   - customFees: (Optional) Array of custom fees
   * 
   * @returns {Promise<string>} The ID of the created token in the format 0.0.X
   * 
   * @throws {Error} If token creation fails due to:
   * - Network connectivity issues
   * - Invalid operator credentials
   * - Transaction execution failure
   * - Invalid token parameters
   * - Insufficient gas/fees
   * 
   * @example
   * ```typescript
   * // Create a token with custom treasury
   * const tokenId = await tokensService.createToken({
   *   name: 'My Token',
   *   symbol: 'MTK',
   *   decimals: 2,
   *   initialSupply: 1000,
   *   treasuryAccountId: '0.0.12345',
   *   adminKey: {
   *     key: operatorPublicKey
   *   }
   * });
   * 
   * // Create a token with operator as treasury
   * const defaultTokenId = await tokensService.createToken({
   *   name: 'Default Token',
   *   symbol: 'DFT',
   *   decimals: 0,
   *   initialSupply: 1000000
   * });
   * ```
   */
  async createToken(
    params: Omit<IHashgraph.ILedger.IHTS.ICreate, 'validatorConsensusTimestamp'>
  ): Promise<string> {
    try {
      const validatorConsensusTimestamp = await this.smartNodeSdkService.sdk.smartNode.validators
        .addTokenValidator(exampleTokensValidator as any);

      // Generate transaction bytes using the Smart Node SDK
      const createTokenTxBytes = await this.smartNodeSdkService.sdk.hashgraph.hts.createToken({
        ...params,
        validatorConsensusTimestamp
      });

      // Convert bytes to transaction object
      const createTokenTx = Transaction.fromBytes(
        new Uint8Array(Buffer.from(createTokenTxBytes))
      );
      
      // Sign the transaction with operator key
      const signedTx = await createTokenTx.sign(
        PrivateKey.fromString(this.operator.privateKey)
      );
      
      // Execute the transaction and get receipt
      const txResponse = await signedTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      
      // Return the new token ID
      return receipt.tokenId.toString();
    } catch (error) {
      this.logger.error(`Failed to create fungible token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mints additional tokens for a fungible token
   * 
   * @param {IHashgraph.ILedger.IHTS.IFungibleToken.IMint} params - Token minting parameters including:
   *   - tokenId: ID of the token to mint additional supply for
   *   - amount: Amount of tokens to mint
   *   - metadata: (Optional) Metadata for the minting operation
   * 
   * @returns {Promise<string>} The transaction ID of the mint operation
   * 
   * @throws {Error} If minting fails due to:
   * - Network connectivity issues
   * - Invalid operator credentials
   * - Transaction execution failure
   * - Invalid token ID or amount
   * - Insufficient permissions (requires supply key)
   * 
   * @example
   * ```typescript
   * // Mint additional tokens
   * const txId = await tokensService.mintFungibleTokens({
   *   tokenId: '0.0.12345',
   *   amount: 500
   * });
   * console.log(`Minted 500 additional tokens, transaction: ${txId}`);
   * 
   * // Mint a large amount of tokens
   * const largeTxId = await tokensService.mintFungibleTokens({
   *   tokenId: '0.0.12345',
   *   amount: 1000000
   * });
   * ```
   */
  async mintFungibleTokens(
    params: IHashgraph.ILedger.IHTS.IFungibleToken.IMint
  ): Promise<string> {
    try {
      // Generate transaction bytes for minting tokens
      const mintTxBytes = await this.smartNodeSdkService.sdk.hashgraph.hts.mintToken(params);
      
      // Convert bytes to transaction object
      const mintTx = Transaction.fromBytes(
        new Uint8Array(Buffer.from(mintTxBytes))
      );
      
      // Sign transaction with operator key
      const signedTx = await mintTx.sign(
        PrivateKey.fromString(this.operator.privateKey)
      );
      
      // Execute transaction
      const txResponse = await signedTx.execute(this.client);
      
      // Return the transaction ID
      return txResponse.transactionId.toString();
    } catch (error) {
      this.logger.error(`Failed to mint tokens: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gets information about a specific token
   * 
   * @param {string} tokenId - ID of the token to query in the format 0.0.X
   * 
   * @returns {Promise<TokenInfo>} Detailed information about the token including:
   *   - name: Token name
   *   - symbol: Token symbol
   *   - decimals: Number of decimal places
   *   - totalSupply: Current total supply
   *   - treasuryAccountId: Treasury account
   *   - adminKey: Admin key (if present)
   *   - kycKey: KYC key (if present)
   *   - freezeKey: Freeze key (if present)
   *   - wipeKey: Wipe key (if present)
   *   - supplyKey: Supply key (if present)
   *   - defaultFreezeStatus: Whether accounts are frozen by default
   *   - defaultKycStatus: Whether accounts have KYC by default
   *   - tokenType: Type of token (FUNGIBLE_COMMON, NON_FUNGIBLE_UNIQUE)
   *   - supplyType: Supply type (FINITE, INFINITE)
   *   - maxSupply: Maximum supply (if finite)
   * 
   * @throws {Error} If token information retrieval fails due to:
   * - Network connectivity issues
   * - Invalid token ID
   * - Token not found
   * - Node unavailability
   * 
   * @example
   * ```typescript
   * // Get basic token information
   * const tokenInfo = await tokensService.getTokenInfo('0.0.12345');
   * console.log(`Token name: ${tokenInfo.name}`);
   * console.log(`Total supply: ${tokenInfo.totalSupply.toString()}`);
   * console.log(`Decimals: ${tokenInfo.decimals}`);
   * 
   * // Check token properties
   * if (tokenInfo.adminKey) {
   *   console.log('Token has admin key configured');
   * }
   * if (tokenInfo.kycKey) {
   *   console.log('Token has KYC key configured');
   * }
   * if (tokenInfo.supplyKey) {
   *   console.log('Token supply can be modified');
   * }
   * ```
   */
  async getTokenInfo(tokenId: string): Promise<TokenInfo> {
    try {
      // Use the Smart Node SDK to query token information
      return await this.smartNodeSdkService.sdk.hashgraph.hts.getTokenInfo(tokenId);
    } catch (error) {
      this.logger.error(`Failed to retrieve token info: ${error.message}`);
      throw error;
    }
  }
} 