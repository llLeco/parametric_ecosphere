/**
 * @module SmartNodeCommonService
 * @description Shared service for common SmartNode interactions
 * 
 * This service provides common functionality for SmartNode operations that are
 * used across multiple modules, including:
 * - Topic creation and management
 * - Message submission to topics
 * - Validator creation and management
 * - Transaction signing and execution
 * - Common blockchain operations
 * 
 * This service helps avoid code duplication across consumer files and provides
 * a centralized place for SmartNode-related operations.
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerHelper } from '@hsuite/helpers';
import { SmartNodeSdkService } from '@hsuite/smartnode-sdk';
import { SmartConfigService } from '@hsuite/smart-config';
import { Client, PrivateKey, Transaction, AccountId } from '@hashgraph/sdk';
import { ChainType, ILedger, SmartLedgersService } from '@hsuite/smart-ledgers';
import { IHashgraph } from '@hsuite/hashgraph-types';

/**
 * @interface ITopicCreationResult
 * @description Result of topic creation operation
 */
export interface ITopicCreationResult {
  topicId: string;
  transactionId: string;
  consensusTimestamp: string;
}

/**
 * @interface IMessageSubmissionResult
 * @description Result of message submission operation
 */
export interface IMessageSubmissionResult {
  transactionId: string;
  consensusTimestamp: string;
}

/**
 * @interface IValidatorCreationResult
 * @description Result of validator creation operation
 */
export interface IValidatorCreationResult {
  consensusTimestamp: string;
  validatorData: any;
}

/**
 * @class SmartNodeCommonService
 * @description Shared service for common SmartNode operations
 * 
 * This service provides centralized functionality for SmartNode operations
 * that are commonly used across different modules. It handles:
 * - Blockchain client initialization
 * - Topic creation with validators
 * - Message submission to topics
 * - Transaction signing and execution
 * - Common validation operations
 * 
 * @implements {OnModuleInit}
 */
@Injectable()
export class SmartNodeCommonService implements OnModuleInit {
  private readonly logger: LoggerHelper = new LoggerHelper(SmartNodeCommonService.name);
  private readonly operator: IHashgraph.IOperator;
  private client: Client;
  private ledger: ILedger;
  private chain: ChainType;

  /**
   * @constructor
   * @description Creates a new instance of SmartNodeCommonService
   * 
   * @param {SmartNodeSdkService} smartNodeSdkService - Service for smart node operations
   * @param {SmartConfigService} smartConfigService - Service for configuration
   * @param {SmartLedgersService} smartLedgersService - Service for blockchain ledger operations
   */
  constructor(
    private readonly smartNodeSdkService: SmartNodeSdkService,
    private readonly smartConfigService: SmartConfigService,
    private readonly smartLedgersService: SmartLedgersService
  ) {
    this.operator = this.smartConfigService.getOperator();
  }

  /**
   * @method onModuleInit
   * @description Lifecycle hook that initializes the service when the module is loaded
   * 
   * Initializes the blockchain client and ledger interface based on the configured chain type.
   * 
   * @returns {Promise<void>}
   */
  async onModuleInit() {
    this.chain = this.smartConfigService.getChain();
    this.ledger = this.smartLedgersService.getAdapter(this.chain).getLedger();
    this.client = await this.ledger.getClient();
  }

  /**
   * @method createTopicWithValidator
   * @description Creates a Hedera topic with a validator
   * 
   * This method creates a validator and then creates a topic with that validator.
   * It's commonly used for creating DAO proposal topics and vote topics.
   * 
   * @param {any} validator - The validator configuration
   * @param {string} description - Optional description for the topic
   * @returns {Promise<ITopicCreationResult>} The created topic information
   * 
   * @throws {Error} If topic creation fails
   */
  async createTopicWithValidator(validator: any): Promise<ITopicCreationResult> {
    try {
      this.logger.debug(`Creating topic with validator: ${JSON.stringify(validator)}`);

      // Save validator using Smart Node SDK
      const validatorConsensusTimestamp = await this.smartNodeSdkService.sdk.smartNode.validators
        .addConsensusValidator(validator as any);
      
      this.logger.debug(`Validator created with consensus timestamp: ${validatorConsensusTimestamp}`);

      // Create topic with validator
      const createTopicTxBytes = await this.smartNodeSdkService.sdk.hashgraph.hcs.createTopic({ 
        validatorConsensusTimestamp: validatorConsensusTimestamp.toString()
      });
      
      const createTopicTx = Transaction.fromBytes(new Uint8Array(Buffer.from(createTopicTxBytes)));
      const signedTx = await createTopicTx.sign(PrivateKey.fromString(this.operator.privateKey));
      const txResponse = await signedTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      const record = await txResponse.getRecord(this.client);

      const topicId = receipt.topicId.toString();
      const transactionId = txResponse.transactionId.toString();
      const consensusTimestamp = record.consensusTimestamp.toString();

      this.logger.debug(`Successfully created topic ${topicId} with transaction ID: ${transactionId}`);

      return {
        topicId,
        transactionId,
        consensusTimestamp
      };
    } catch (error) {
      this.logger.error(`Failed to create topic with validator: ${error.message}`);
      throw new Error(`Failed to create topic with validator: ${error.message}`);
    }
  }

  /**
   * @method submitMessageToTopic
   * @description Submits a message to a Hedera topic
   * 
   * This method signs and submits a message to a specified Hedera topic.
   * It handles the message formatting, signing, and transaction execution.
   * 
   * @param {string} topicId - The Hedera topic ID
   * @param {any} message - The message data to submit
   * @param {string} senderId - Optional sender ID (defaults to operator account ID)
   * @returns {Promise<IMessageSubmissionResult>} The submission result
   * 
   * @throws {Error} If message submission fails
   */
  async submitMessageToTopic(topicId: string, message: any, senderId?: string): Promise<IMessageSubmissionResult> {
    try {
      this.logger.debug(`Submitting message to topic ${topicId} with operator ${this.operator.accountId}`);

      // Generate transaction bytes using Smart Node SDK
      this.logger.debug(`Generating submit message transaction bytes...`);
      this.logger.debug(`Message being sent: ${JSON.stringify(message, null, 2)}`);
      
      // Log each field individually to identify the problematic one
      this.logger.debug(`Message field analysis:`);
      this.logger.debug(`- type: ${typeof message.type} = ${message.type}`);
      this.logger.debug(`- policyId: ${typeof message.policyId} = ${message.policyId}`);
      this.logger.debug(`- status: ${typeof message.status} = ${message.status}`);
      this.logger.debug(`- reason: ${typeof message.reason} = ${message.reason}`);
      this.logger.debug(`- effectiveAt: ${typeof message.effectiveAt} = ${message.effectiveAt}`);
      this.logger.debug(`- period: ${typeof message.period} = ${message.period}`);
      this.logger.debug(`- amount: ${typeof message.amount} = ${message.amount}`);
      this.logger.debug(`- dueAt: ${typeof message.dueAt} = ${message.dueAt}`);
      this.logger.debug(`- paidAt: ${typeof message.paidAt} = ${message.paidAt}`);
      this.logger.debug(`- txId: ${typeof message.txId} = ${message.txId}`);
      this.logger.debug(`- ruleRef: ${typeof message.ruleRef} = ${JSON.stringify(message.ruleRef)}`);
      this.logger.debug(`- ruleRef.topicId: ${typeof message.ruleRef?.topicId} = ${message.ruleRef?.topicId}`);
      this.logger.debug(`- ruleRef.ts: ${typeof message.ruleRef?.ts} = ${message.ruleRef?.ts}`);
      
      this.logger.debug(`Calling Smart Node SDK submitMessage with topicId: ${topicId}`);

      // Prepare message for submission
      const messageString = JSON.stringify(message);
      const messageBuffer = Buffer.from(messageString);
      const privateKey = PrivateKey.fromStringED25519(this.operator.privateKey);
      const signature = privateKey.sign(messageBuffer);

      this.logger.debug(`Message payload: ${messageString}`);
      this.logger.debug(`Signature length: ${signature.length}`);
      
      // Use required structure with signature and sender
      const submitMsgTxBytes = await this.smartNodeSdkService.sdk.hashgraph.hcs.submitMessage(topicId, {
        message: messageString,
        signature: signature,
        sender: {
          id: this.operator.accountId
        }
      } as any);
      
      this.logger.debug(`Transaction bytes generated successfully, length: ${submitMsgTxBytes.length}`);
      
      const submitMsgTx = Transaction.fromBytes(new Uint8Array(Buffer.from(submitMsgTxBytes)));
      this.logger.debug(`Transaction deserialized successfully`);
      
      const signTx = await submitMsgTx.sign(PrivateKey.fromStringED25519(this.operator.privateKey));
      this.logger.debug(`Transaction signed successfully`);
      
      const txResponse = await signTx.execute(this.client);
      this.logger.debug(`Transaction executed successfully`);
      
      const record = await txResponse.getRecord(this.client);
      this.logger.debug(`Transaction record retrieved successfully`);
      
      const transactionId = txResponse.transactionId.toString();
      const consensusTimestamp = record.consensusTimestamp.toString();
      
      this.logger.debug(`Message submitted to topic ${topicId} with transaction ID: ${transactionId}`);
      
      return { transactionId, consensusTimestamp };
    } catch (error) {
      this.logger.error(`Failed to submit message to topic ${topicId}: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      this.logger.error(`Error details: ${JSON.stringify(error, null, 2)}`);
      throw new Error(`Failed to submit message to topic: ${error.message}`);
    }
  }

  /**
   * @method createValidator
   * @description Creates a validator using Smart Node SDK
   * 
   * This method creates a validator and returns the consensus timestamp.
   * It's used as a helper method for topic creation.
   * 
   * @param {any} validator - The validator configuration
   * @returns {Promise<IValidatorCreationResult>} The validator creation result
   * 
   * @throws {Error} If validator creation fails
   */
  async createValidator(validator: any): Promise<IValidatorCreationResult> {
    try {
      this.logger.debug(`Creating validator: ${JSON.stringify(validator)}`);

      const consensusTimestamp = await this.smartNodeSdkService.sdk.smartNode.validators
        .addConsensusValidator(validator as any);
      
      this.logger.debug(`Validator created with consensus timestamp: ${consensusTimestamp}`);

      return {
        consensusTimestamp: consensusTimestamp.toString(),
        validatorData: validator
      };
    } catch (error) {
      this.logger.error(`Failed to create validator: ${error.message}`);
      throw new Error(`Failed to create validator: ${error.message}`);
    }
  }

  /**
   * @method signAndExecuteTransaction
   * @description Signs and executes a transaction
   * 
   * This method provides a common way to sign and execute transactions
   * using the operator's private key.
   * 
   * @param {Transaction} transaction - The transaction to sign and execute
   * @returns {Promise<{ transactionId: string; consensusTimestamp: string }>} The transaction result
   * 
   * @throws {Error} If transaction execution fails
   */
  async signAndExecuteTransaction(transaction: Transaction): Promise<{ transactionId: string; consensusTimestamp: string }> {
    try {
      const signedTx = await transaction.sign(PrivateKey.fromString(this.operator.privateKey));
      const txResponse = await signedTx.execute(this.client);
      const record = await txResponse.getRecord(this.client);
      
      const transactionId = txResponse.transactionId.toString();
      const consensusTimestamp = record.consensusTimestamp.toString();
      
      this.logger.debug(`Transaction executed with ID: ${transactionId}`);
      
      return { transactionId, consensusTimestamp };
    } catch (error) {
      this.logger.error(`Failed to execute transaction: ${error.message}`);
      throw new Error(`Failed to execute transaction: ${error.message}`);
    }
  }

  /**
   * @method getOperator
   * @description Gets the current operator information
   * 
   * @returns {IHashgraph.IOperator} The operator information
   */
  getOperator(): IHashgraph.IOperator {
    return this.operator;
  }

  /**
   * @method getClient
   * @description Gets the initialized blockchain client
   * 
   * @returns {Client} The blockchain client
   */
  getClient(): Client {
    return this.client;
  }

  /**
   * @method getChain
   * @description Gets the current chain type
   * 
   * @returns {ChainType} The chain type
   */
  getChain(): ChainType {
    return this.chain;
  }
} 