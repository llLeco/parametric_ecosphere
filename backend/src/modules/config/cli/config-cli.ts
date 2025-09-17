/**
 * @module configs-cli
 * @description Command-line interface for database configurations
 * 
 * This module provides a comprehensive command-line interface (CLI) for managing database configurations,
 * allowing administrators to create, update, and manage database configs through an intuitive command-line interface.
 * It's implemented using the nest-commander pattern to seamlessly integrate CLI commands within the NestJS framework.
 * 
 * The module handles blockchain-specific operations through a chain-agnostic approach, with specialized
 * implementations for different blockchain networks like Hedera Hashgraph and Ripple.
 */

import { Command, CommandRunner, Option } from 'nest-commander';
import { Injectable, LoggerService, OnModuleInit } from '@nestjs/common';
import { SmartNodeSdkService } from '@hsuite/smartnode-sdk';
import * as policyRegistryValidator from '../validators/policyRegistry.topic.validator.json';
import * as rulesValidator from '../validators/rules.topic.validator.json';
import * as triggersValidator from '../validators/triggers.topic.validator.json';
import { IValidators } from '@hsuite/validators-types';
import { InjectModel } from '@nestjs/mongoose';
import { Config, ConfigDocument } from '../entities/config.entity';
import { Model } from 'mongoose';
import { Client, PrivateKey, Transaction } from '@hashgraph/sdk';
import { SmartConfigService } from '@hsuite/smart-config';
import { IHashgraph } from '@hsuite/hashgraph-types';
import { ChainType, ILedger, SmartLedgersService } from '@hsuite/smart-ledgers';
// Import inquirer using require to avoid ES module issues
const inquirer = require('inquirer');

/**
 * @class CustomCliLogger
 * @description Custom logger implementation for CLI commands
 * 
 * This logger extends the NestJS LoggerService interface and ensures proper functionality
 * in command-line contexts. It provides direct console output with color-coded log levels
 * while maintaining the structured logging capabilities expected from a NestJS Logger.
 * 
 * The logger supports multiple log levels (log, error, warn, debug, verbose) and
 * contextual logging to help identify the source of log messages.
 */
@Injectable()
export class CustomCliLogger implements LoggerService {
  /**
   * Optional context name for the logger
   * @private
   */
  private context?: string;

  /**
   * Creates a new logger instance with optional context
   * 
   * @param context - Optional context name for the logger that will be prefixed to all log messages
   */
  constructor(context?: string) {
    this.context = context;
  }

  /**
   * Logs a message at the 'log' level with green color coding
   * 
   * @param message - The message to log, can be any serializable object
   * @param context - Optional context override for this specific log message
   * @returns {any} The result of the console.log operation
   */
  log(message: any, context?: string): any {
    const currentContext = context || this.context;
    const formattedMessage = currentContext ? `[${currentContext}] ${message}` : message;
    console.log(`\x1b[32mLOG\x1b[0m ${formattedMessage}`);
  }

  /**
   * Logs a message at the 'error' level with red color coding
   * 
   * @param message - The error message to log
   * @param trace - Optional stack trace for error debugging
   * @param context - Optional context override for this specific error message
   * @returns {any} The result of the console.error operation
   */
  error(message: any, trace?: string, context?: string): any {
    const currentContext = context || this.context;
    const formattedMessage = currentContext ? `[${currentContext}] ${message}` : message;
    console.error(`\x1b[31mERROR\x1b[0m ${formattedMessage}`);
    if (trace) {
      console.error(trace);
    }
  }

  /**
   * Logs a message at the 'warn' level with yellow color coding
   * 
   * @param message - The warning message to log
   * @param context - Optional context override for this specific warning message
   * @returns {any} The result of the console.warn operation
   */
  warn(message: any, context?: string): any {
    const currentContext = context || this.context;
    const formattedMessage = currentContext ? `[${currentContext}] ${message}` : message;
    console.warn(`\x1b[33mWARN\x1b[0m ${formattedMessage}`);
  }

  /**
   * Logs a message at the 'debug' level with blue color coding
   * 
   * @param message - The debug message to log
   * @param context - Optional context override for this specific debug message
   * @returns {any} The result of the console.debug operation
   */
  debug(message: any, context?: string): any {
    const currentContext = context || this.context;
    const formattedMessage = currentContext ? `[${currentContext}] ${message}` : message;
    console.debug(`\x1b[34mDEBUG\x1b[0m ${formattedMessage}`);
  }

  /**
   * Logs a message at the 'verbose' level with cyan color coding
   * 
   * @param message - The verbose message to log
   * @param context - Optional context override for this specific verbose message
   * @returns {any} The result of the console.debug operation
   */
  verbose(message: any, context?: string): any {
    const currentContext = context || this.context;
    const formattedMessage = currentContext ? `[${currentContext}] ${message}` : message;
    console.debug(`\x1b[36mVERBOSE\x1b[0m ${formattedMessage}`);
  }
}

/**
 * @class ConfigCommand
 * @description Command implementation for parametric insurance ecosystem initialization
 * 
 * Provides comprehensive command-line functionality for initializing the parametric insurance ecosystem.
 * This class handles the creation of essential HCS topics for the insurance system:
 * - Policy Registry Topic: Stores insurance policy information
 * - Rules Topic: Manages insurance rules and payout conditions
 * - Triggers Topic: Handles weather data and trigger events
 * 
 * Key features:
 * - Creates 3 essential HCS topics for parametric insurance
 * - Blockchain-specific topic creation with proper validators
 * - Interactive confirmation prompts for destructive operations
 * - Force flag support for automated/scripted usage
 * - Comprehensive error handling and logging
 * 
 * @implements {CommandRunner}
 * @implements {OnModuleInit}
 */
@Injectable()
@Command({ name: 'config', description: 'Initialize parametric insurance ecosystem with HCS topics' })
export class ConfigCommand extends CommandRunner implements OnModuleInit {
  /**
   * Internal logger for command operations with contextual information
   * @private
   * @readonly
   */
  private readonly logger: LoggerService;

  /**
   * Operator credentials for blockchain operations
   * Contains the account ID and private key needed for signing transactions
   * @private
   */
  private operator: IHashgraph.IOperator;

  /**
   * Blockchain client instance for network operations
   * Used to submit transactions and query the network
   * @private
   */
  private client: Client;

  /**
   * Ledger interface for blockchain-agnostic operations
   * Provides standardized methods for interacting with different blockchains
   * @private
   */
  private ledger: ILedger;

  /**
   * The current blockchain network type (e.g., HASHGRAPH, RIPPLE)
   * Determines which chain-specific implementations to use
   * @private
   */
  private chain: ChainType;

  /**
   * Topic IDs for the parametric insurance ecosystem
   * @private
   */
  private topicIds: {
    policyRegistry: string | null;
    rules: string | null;
    triggers: string | null;
  } = {
    policyRegistry: null,
    rules: null,
    triggers: null
  };

  /**
   * Creates an instance of ConfigCommand with all required dependencies
   * 
   * @param configModel - Mongoose model for database configuration documents
   * @param smartNodeSdkService - Service for interacting with the Smart Node SDK
   * @param smartConfigService - Service for accessing application configuration
   * @param smartLedgersService - Service for blockchain ledger operations
   */
  constructor(
    @InjectModel(Config.name) private configModel: Model<ConfigDocument>,
    private readonly smartNodeSdkService: SmartNodeSdkService,
    private readonly smartConfigService: SmartConfigService,
    private readonly smartLedgersService: SmartLedgersService
  ) {
    super();
    this.logger = new CustomCliLogger(ConfigCommand.name);
    this.operator = this.smartConfigService.getOperator();
  }

  /**
   * Lifecycle hook that initializes the service when the module is loaded
   * 
   * @description
   * This method is automatically called by NestJS once the module has been initialized.
   * It performs the following initialization tasks:
   * 1. Retrieves the configured blockchain network type from application configuration
   * 2. Initializes the appropriate ledger adapter for the configured blockchain
   * 3. Establishes a client connection to the blockchain network
   * 
   * This initialization ensures that the command is ready to perform blockchain
   * operations when executed.
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
    this.chain = this.smartConfigService.getChain();
    this.ledger = this.smartLedgersService.getAdapter(this.chain).getLedger();
    this.client = await this.ledger.getClient();
  }

  /**
   * Defines a force option for the command to bypass confirmation prompts
   * 
   * @param val - The value passed to the force option (string or boolean)
   * @returns {boolean} True if force option is enabled, false otherwise
   */
  @Option({
    flags: '-f, --force',
    description: 'Force initialization of parametric insurance ecosystem even if configuration already exists',
    defaultValue: false,
  })
  parseForce(val: string | boolean): boolean {
    return val === 'true' || val === true;
  }

  /**
   * Prompts the user to confirm replacement of an existing configuration
   * 
   * @description
   * Displays an interactive confirmation prompt asking the user whether they
   * want to replace an existing parametric insurance ecosystem configuration.
   * This provides a safety mechanism to prevent accidental deletion of 
   * configuration data and topic IDs.
   * 
   * @returns {Promise<boolean>} A promise resolving to true if confirmed, false otherwise
   */
  private async promptForConfirmation(): Promise<boolean> {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'A parametric insurance ecosystem configuration already exists. Do you want to replace it? (This will recreate all HCS topics)',
        default: false,
      },
    ]);
    return answers.confirm;
  }

  /**
   * Creates a new configuration document in the database
   * 
   * @description
   * Initializes a new configuration document with default settings and the parametric
   * insurance ecosystem topic IDs. The configuration includes settings for API rate 
   * limiting, administrator addresses, maintenance mode, and custom metadata.
   * 
   * @param {Object} topics - Object containing the three topic IDs
   * @param {string} topics.policyRegistry - Policy Registry topic ID
   * @param {string} topics.rules - Rules topic ID  
   * @param {string} topics.triggers - Triggers topic ID
   * @returns {Promise<ConfigDocument>} The newly created configuration document
   */
  private async createConfig(topics: { policyRegistry: string; rules: string; triggers: string }): Promise<ConfigDocument> {
    return this.configModel.create({
      dao_hcs: topics.policyRegistry, // Keep for backward compatibility
      policyRegistryTopicId: topics.policyRegistry,
      rulesTopicId: topics.rules,
      triggersTopicId: topics.triggers,
      apiRateLimit: 100,
      adminAddresses: [],
      maintenanceMode: false,
      customMetadata: {
        ecosystem: 'parametric-insurance',
        version: '1.0.0',
        topics: {
          policyRegistry: topics.policyRegistry,
          rules: topics.rules,
          triggers: topics.triggers
        }
      },
    });
  }


  /**
   * Executes the config command when invoked from the command line
   * 
   * @description
   * This is the main entry point for the command execution. It handles the entire
   * workflow of initializing the parametric insurance ecosystem:
   * 1. Checks for existing configurations
   * 2. Handles confirmation or force deletion if needed
  3. Creates consensus validators for all 3 topics
   * 4. Creates 3 HCS topics: Policy Registry, Rules, and Triggers
   * 5. Creates and stores the configuration in the database
   * 
   * The method includes comprehensive error handling and logging throughout
   * the process.
   * 
   * @param {string[]} passedParams - Command line arguments (not used in this implementation)
   * @param {Record<string, any>} options - Command options including force flag
   * @returns {Promise<void>} A promise that resolves when the command execution is complete
   */
  async run(
    passedParams: string[],
    options?: Record<string, any>
  ): Promise<void> {
    try {
      this.logger.log('🚀 Initializing Parametric Insurance Ecosystem...');

      // Check if a config already exists
      const existingConfig = await this.configModel.findOne().exec();

      if (existingConfig) {
        this.logger.warn('A configuration already exists in the database');

        // Check if force flag is provided
        const forceCreate = options?.force || false;

        if (!forceCreate) {
          // Prompt user for confirmation
          const confirmed = await this.promptForConfirmation();

          if (!confirmed) {
            this.logger.log('Operation cancelled. Run with --force flag to override without confirmation.');
            return;
          }

          // User confirmed, delete existing config
          await this.configModel.deleteOne({ _id: existingConfig._id });
          this.logger.log('Existing configuration deleted');
        } else {
          // Force flag provided, delete existing config
          await this.configModel.deleteOne({ _id: existingConfig._id });
          this.logger.log('Existing configuration forcefully deleted');
        }
      }

      // Create consensus validators for all 3 topics
      this.logger.log('📋 Creating consensus validators...');
      
      const policyRegistryValidatorResult = await this.smartNodeSdkService.sdk.smartNode.validators
        .addConsensusValidator(policyRegistryValidator as unknown as IValidators.IConsensus.IValidationParams);
      
      const rulesValidatorResult = await this.smartNodeSdkService.sdk.smartNode.validators
        .addConsensusValidator(rulesValidator as unknown as IValidators.IConsensus.IValidationParams);
      
      const triggersValidatorResult = await this.smartNodeSdkService.sdk.smartNode.validators
        .addConsensusValidator(triggersValidator as unknown as IValidators.IConsensus.IValidationParams);

      this.logger.log('✅ Consensus validators created successfully');

      // Create HCS topics based on the current chain type
      this.logger.log('🔗 Creating HCS topics...');
      
      let topics = { policyRegistry: '', rules: '', triggers: '' };
      
      switch(this.chain) {
        case ChainType.HASHGRAPH:
          this.logger.log('Creating Policy Registry topic...');
          topics.policyRegistry = await this.hashgraphCreateTopic(policyRegistryValidatorResult.toString());
          this.logger.log(`✅ Policy Registry topic created: ${topics.policyRegistry}`);

          this.logger.log('Creating Rules topic...');
          topics.rules = await this.hashgraphCreateTopic(rulesValidatorResult.toString());
          this.logger.log(`✅ Rules topic created: ${topics.rules}`);

          this.logger.log('Creating Triggers topic...');
          topics.triggers = await this.hashgraphCreateTopic(triggersValidatorResult.toString());
          this.logger.log(`✅ Triggers topic created: ${topics.triggers}`);
          break;
          
        case ChainType.RIPPLE:
          throw new Error('Ripple is not supported yet');
          
        default:
          throw new Error(`Unsupported chain type: ${this.chain}`);
      }

      // Create and store the configuration
      this.logger.log('💾 Saving configuration to database...');
      const config = await this.createConfig(topics);

      this.logger.log('🎉 Parametric Insurance Ecosystem initialized successfully!');
      this.logger.log(`📊 Configuration ID: ${config._id}`);
      this.logger.log(`📋 Policy Registry Topic: ${topics.policyRegistry}`);
      this.logger.log(`📏 Rules Topic: ${topics.rules}`);
      this.logger.log(`⚡ Triggers Topic: ${topics.triggers}`);
      
    } catch (error) {
      this.logger.error('❌ Failed to initialize parametric insurance ecosystem', error);
      throw error;
    }
  }

  /**
   * Creates a Hedera Consensus Service topic for parametric insurance ecosystem
   * 
   * @description
   * This method handles the Hashgraph-specific implementation of topic creation
   * for the parametric insurance ecosystem. It performs the following steps:
   * 1. Requests a transaction from the Smart Node SDK
   * 2. Deserializes the transaction bytes
   * 3. Signs the transaction with the operator's private key
   * 4. Submits the transaction to the Hedera network
   * 5. Retrieves and returns the topic ID from the receipt
   * 
   * This method is used to create all three essential topics:
   * - Policy Registry Topic
   * - Rules Topic  
   * - Triggers Topic
   * 
   * @param {string} consensusValidator - The consensus validator timestamp to associate with the topic
   * @returns {Promise<string>} A promise resolving to the created topic ID
   * @throws {Error} If topic creation fails for any reason
   */
  private async hashgraphCreateTopic(consensusValidator: string): Promise<string> {
    try {
      let transactionToExecute = await this.smartNodeSdkService.sdk.hashgraph.hcs.createTopic({
        validatorConsensusTimestamp: consensusValidator.toString()
      });

      let transaction = Transaction.fromBytes(new Uint8Array(Buffer.from(transactionToExecute)));
      const signTx = await transaction.sign(PrivateKey.fromStringED25519(this.operator.privateKey));

      const submitTx = await signTx.execute(this.client);
      const receipt = await submitTx.getReceipt(this.client);

      return receipt.topicId.toString();
    } catch(error) {
      throw new Error(`Failed to create topic: ${error}`);
    }
  }
}