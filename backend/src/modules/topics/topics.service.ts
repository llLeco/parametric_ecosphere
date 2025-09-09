import { Injectable, OnModuleInit } from '@nestjs/common';
import { SmartNodeSdkService } from '@hsuite/smartnode-sdk';
import { SmartConfigService } from '@hsuite/smart-config';
import { Transaction, PrivateKey, Client } from '@hashgraph/sdk';
import { LoggerHelper } from '@hsuite/helpers';
import { Hashgraph, IHashgraph } from '@hsuite/hashgraph-types';
import * as exampleTopicsValidator from './validators/example.topics.validator.json';
import { ChainType, ILedger, SmartLedgersService } from '@hsuite/smart-ledgers';

/**
 * @class TopicsService
 * @description Service for managing Hedera Consensus Service (HCS) topics
 * 
 * This service provides core functionality for interacting with the Hedera Consensus Service,
 * including topic creation, message submission, and information retrieval. It leverages the
 * SmartNodeSdkService for Hedera network operations and implements proper error handling
 * and logging.
 * 
 * @example
 * ```typescript
 * // Example usage in a NestJS service
 * @Injectable()
 * class MyService {
 *   constructor(private readonly topicsService: TopicsService) {}
 * 
 *   async createAndPostMessage() {
 *     const topicId = await this.topicsService.createTopic('My App Messages');
 *     await this.topicsService.submitMessage(topicId, 'Hello World!');
 *   }
 * }
 * ```
 * 
 * @see SmartNodeSdkService
 * @see LoggerHelper
 * @see smartLedgersService
 */
@Injectable()
export class TopicsService implements OnModuleInit {
  /**
   * Logger instance for service operations
   * @private
   */
  private readonly logger = new LoggerHelper(TopicsService.name);
  
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
   * Creates an instance of the TopicsService
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
   * Creates a new topic on the Hedera network
   * 
   * @param {Omit<IHashgraph.ILedger.IHCS.ITopic.ICreate, 'validatorConsensusTimestamp'>} params - Parameters for topic creation
   * @returns {Promise<string>} The ID of the created topic
   * 
   * @throws {Error} If topic creation fails due to:
   * - Network connectivity issues
   * - Invalid operator credentials
   * - Transaction execution failure
   * 
   * @example
   * ```typescript
   * // Create a topic with a custom memo
   * const topicId = await topicsService.createTopic({
   *   memo: 'My app messages',
   *   validatorConsensusTimestamp: new Date().toISOString()
   * });
   * console.log(`Created topic: ${topicId}`);
   * ```
   */
  async createTopic(
    params: Omit<IHashgraph.ILedger.IHCS.ITopic.ICreate, 'validatorConsensusTimestamp'>
  ): Promise<string> {
    try {
      const validatorConsensusTimestamp = await this.smartNodeSdkService.sdk.smartNode.validators
        .addConsensusValidator(exampleTopicsValidator as any);

      // Generate transaction bytes using the Smart Node SDK
      const createTopicTxBytes = await this.smartNodeSdkService.sdk.hashgraph.hcs.createTopic({
        ...params,
        validatorConsensusTimestamp
      });

      // Convert bytes to transaction object
      const createTopicTx = Transaction.fromBytes(
        new Uint8Array(Buffer.from(createTopicTxBytes))
      );
      
      // Sign the transaction with operator key
      const signedTx = await createTopicTx.sign(
        PrivateKey.fromString(this.operator.privateKey)
      );
      
      // Execute the transaction and get receipt
      const txResponse = await signedTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      
      // Return the new topic ID
      return receipt.topicId.toString();
    } catch (error) {
      this.logger.error(`Failed to create topic: ${error.message}`);
      throw error;
    }
  }

  /**
   * Submits a message to an existing topic
   * 
   * @param params - Parameters for message submission
   * @returns {Promise<string>} The transaction ID of the submission
   * 
   * @throws {Error} If message submission fails due to:
   * - Invalid topic ID
   * - Network connectivity issues
   * - Transaction execution failure
   * 
   * @example
   * ```typescript
   * // Submit a simple text message
   * const txId = await topicsService.submitMessage({
   *   topicId: '0.0.12345',
   *   message: 'Hello from Smart App!'
   * });
   * 
   * // Submit a JSON message
   * const jsonMessage = JSON.stringify({ event: 'user_login', userId: '123' });
   * const jsonTxId = await topicsService.submitMessage({
   *   topicId: '0.0.12345',
   *   message: jsonMessage
   * });
   * ```
   */
  async submitMessage(
    topicId: string,
    params: Omit<IHashgraph.ILedger.IHCS.ITopic.IMessage.ISubmit, 'signature'>
  ): Promise<string> {
    try {
      let bytes = new Uint8Array(Buffer.from(JSON.stringify(params.message)));
      const signature = PrivateKey.fromString(this.operator.privateKey).sign(bytes);

      // Generate transaction bytes for submitting a message
      const submitMsgTxBytes = await this.smartNodeSdkService.sdk.hashgraph.hcs.submitMessage(topicId, {
        ...params,
        signature: signature
      });
      
      // Convert bytes to transaction object
      const submitMsgTx = Transaction.fromBytes(
        new Uint8Array(Buffer.from(submitMsgTxBytes))
      );
      
      // Sign transaction with operator key
      const signedTx = await submitMsgTx.sign(
        PrivateKey.fromString(this.operator.privateKey)
      );
      
      // Execute transaction
      const txResponse = await signedTx.execute(this.client);
      
      // Return the transaction ID
      return txResponse.transactionId.toString();
    } catch (error) {
      this.logger.error(`Failed to submit message: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieves message history for a topic
   * 
   * @param topicId - ID of the topic to query
   * @param encoding - Message encoding format
   * @param limit - Maximum number of messages to retrieve
   * @param order - Sort order (asc/desc)
   * @param sequenceNumber - Starting sequence number
   * @param timestamp - Starting timestamp
   * @returns {Promise<Hashgraph.Restful.HCS.Message.Entity[]>} Array of messages with sequence numbers and timestamps
   * 
   * @throws {Error} If message retrieval fails due to:
   * - Invalid topic ID
   * - Network connectivity issues
   * - Mirror node query failure
   * 
   * @example
   * ```typescript
   * // Get last 10 messages
   * const messages = await topicsService.getTopicMessages({
   *   callbackSuccess: (msg) => console.log(`Message: ${msg.contents}`),
   *   callbackError: (msg, err) => console.error(`Error: ${err.message}`),
   *   start: 0,
   *   end: 10,
   *   limit: 10
   * });
   * ```
   */
  async getTopicMessages(
    topicId: string,
    encoding?: string,
    limit?: number,
    order?: string,
    sequenceNumber?: number,
    timestamp?: string
  ): Promise<Hashgraph.Restful.HCS.Message.Entity[]> {
    try {
      // Use the Smart Node SDK to query the mirror node for messages
      return await this.smartNodeSdkService.sdk.hashgraph.hcs.getRestfulMessages(
        topicId,
        encoding,
        limit,
        order,
        sequenceNumber,
        timestamp
      );
    } catch (error) {
      this.logger.error(`Failed to retrieve topic messages: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gets information about a specific topic
   * 
   * @param topicId - ID of the topic to query
   * @returns {Promise<IHashgraph.ILedger.IHCS.ITopic.IInfo>} Detailed information about the topic
   * 
   * @throws {Error} If topic information retrieval fails due to:
   * - Invalid topic ID
   * - Network connectivity issues
   * - Mirror node query failure
   * 
   * @example
   * ```typescript
   * // Get basic topic information
   * const topicInfo = await topicsService.getTopicInfo('0.0.12345');
   * console.log(`Topic memo: ${topicInfo.topicMemo}`);
   * console.log(`Created at: ${topicInfo.expirationTime}`);
   * 
   * // Check if topic has admin key
   * if (topicInfo.adminKey) {
   *   console.log('Topic has admin key configured');
   * }
   * ```
   */
  async getTopicInfo(topicId: string): Promise<IHashgraph.ILedger.IHCS.ITopic.IInfo> {
    try {
      // Use the Smart Node SDK to query topic information
      return await this.smartNodeSdkService.sdk.hashgraph.hcs.getTopicInfo(topicId);
    } catch (error) {
      this.logger.error(`Failed to retrieve topic info: ${error.message}`);
      throw error;
    }
  }
} 