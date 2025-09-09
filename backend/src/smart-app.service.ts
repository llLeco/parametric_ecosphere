import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientService } from '@hsuite/client';
import { AxiosError } from 'axios';
import { ISmartNetwork } from '@hsuite/smart-network-types';
import { LoggerHelper } from '@hsuite/helpers';

/**
 * SmartAppService class
 * 
 * @description
 * Core service responsible for initializing and managing the Smart Application's
 * connection to the Hedera network. This service handles:
 * 
 * - Hedera client initialization and configuration
 * - Network operator management
 * - WebSocket connections for real-time updates
 * - Transaction creation, signing, and submission
 * - Smart Node and Smart App identification
 * 
 * The service acts as a bridge between the application and the Hedera network,
 * providing a unified interface for all Hedera-related operations.
 * 
 * @example
 * ```typescript
 * // Inject the service in a controller
 * constructor(private readonly smartAppService: SmartAppService) {}
 * 
 * // Get Smart Node identifier
 * async getNodeIdentifier() {
 *   const identifier = await this.smartAppService.smartNodeIdentifier();
 *   return identifier;
 * }
 * ```
 */
@Injectable()
export class SmartAppService implements OnModuleInit {
  /**
   * Logger instance for logging messages
   * 
   * @description
   * Provides structured logging capabilities throughout the service.
   * Uses the class name as the context for all log messages.
   * 
   * @private
   * @readonly
   */
  private readonly logger: LoggerHelper = new LoggerHelper(SmartAppService.name);

  /**
   * Creates a new instance of the SmartAppService
   * 
   * @description
   * Initializes the service with required dependencies and configures
   * the Hedera client with the appropriate network settings.
   * 
   * @param smartClient - Service for handling authentication and API requests
   */
  constructor(
    private readonly smartClient: ClientService
  ) {}

  /**
   * Lifecycle hook that runs when the module is initialized
   * 
   * @description
   * Performs initial setup tasks when the application starts:
   * 1. Retrieves the user session information
   * 2. Creates a new HCS topic for wallet operations
   * 3. Signs and submits the transaction to the Hedera network
   * 4. Logs the resulting topic ID
   * 
   * @throws Will log errors that occur during initialization
   */
  async onModuleInit(): Promise<void> { }

  /**
   * Retrieves the Smart Node identifier information
   * 
   * @description
   * Fetches identification details about the connected Smart Node,
   * including network information, node status, and capabilities.
   * 
   * @returns Promise resolving to the Smart Node identifier entity
   * @throws Will reject the promise if the API request fails
   * 
   * @example
   * ```typescript
   * try {
   *   const nodeInfo = await smartAppService.smartNodeIdentifier();
   *   console.log(`Connected to node: ${nodeInfo.nodeId}`);
   * } catch (error) {
   *   console.error('Failed to get node information:', error);
   * }
   * ```
   */
  async smartNodeIdentifier(): Promise<ISmartNetwork.IOperator.IEntity> {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await this.smartClient.axios.get(
          '/smart-node/identifier'
        );

        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Retrieves the Smart App identifier and subscription status
   * 
   * @description
   * Fetches identification details about the current Smart App instance
   * and its Web3 subscription status. This information includes:
   * - Application ID and version
   * - Subscription details and validity
   * - Connected network information
   * - Available services and capabilities
   * 
   * @returns Promise resolving to the Smart App identifier and subscription status
   * @throws Will reject the promise if the API request fails
   * 
   * @example
   * ```typescript
   * try {
   *   const appInfo = await smartAppService.smartAppIdentifier();
   *   console.log(`App ID: ${appInfo.id}, Subscription: ${appInfo.subscription.status}`);
   * } catch (error) {
   *   console.error('Failed to get app information:', error);
   * }
   * ```
   */
  async smartAppIdentifier(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await this.smartClient.axios.get(
          '/subscriptions/web3/status'
        );

        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  }
}