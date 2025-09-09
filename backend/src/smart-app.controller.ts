import { BadRequestException, Controller, Get } from '@nestjs/common';
import { SmartAppService } from './smart-app.service';
import { ApiNotFoundResponse, ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@hsuite/nestjs-swagger';
import { Public } from '@hsuite/auth-types';

/**
 * @class SmartAppController
 * @description Controller responsible for handling Smart Application related endpoints
 * 
 * This controller provides API endpoints for retrieving information about the Smart Application
 * and its connection to the Smart Node network. It exposes public endpoints that return
 * identification and subscription details for the application and connected node operator.
 * 
 * All endpoints in this controller are marked as public (@Public decorator), meaning they
 * don't require authentication tokens, but some operations may still check user context
 * internally if the user is authenticated.
 * 
 * @category Controllers
 * @example
 * // Example request to get Smart Node identifier
 * GET /smart-app/smart-node-identifier
 * 
 * // Example request to get Smart App identifier
 * GET /smart-app/smart-app-identifier
 */
@Controller('smart-app')
@ApiTags('smart-app')
@Public()
export class SmartAppController {
  /**
   * @constructor
   * @param {SmartAppService} smartAppService - Service that handles Smart App business logic
   * @description Initializes the controller with required dependencies
   */
  constructor(
    private readonly smartAppService: SmartAppService
  ) {}

  /**
   * @method smartNodeIdentifier
   * @description Retrieves the identifier and details of the SmartNodeOperator connected to this application
   * 
   * This endpoint fetches comprehensive information about the Smart Node Operator that this
   * Smart Application is connected to. The information includes the operator's network identity,
   * connection status, and operational details.
   * 
   * @returns {Promise<any>} Object containing SmartNodeOperator details including identifier, 
   *                         network status, and connection information
   * @throws {BadRequestException} If the Smart Node connection fails or returns an error
   * 
   * @example
   * // Example response
   * {
   *   "operatorId": "0.0.12345",
   *   "status": "active",
   *   "networkType": "mainnet",
   *   "connectionDetails": {
   *     "lastSeen": "2023-06-15T10:30:45Z",
   *     "uptime": "99.8%"
   *   }
   * }
   */
  @ApiOperation({
    summary: 'get the identifier of the SmartNodeOperator this SmartApp is connected to',
    description: 'This endpoint is only available if the user is authenticated. \
    It will return the details about the SmartNodeOperator.'
  })
  @ApiOkResponse({
    type: Object,
    status: 200,
    description: "Returns a SmartNodeOperator."
  })
  @ApiNotFoundResponse({
    description: "Smart Node Operator not found or connection not established"
  })
  @ApiBadRequestResponse({
    description: "Invalid request or error retrieving Smart Node Operator details"
  })
  @Get('smart-node-identifier')
  async smartNodeIdentifier(): Promise<any> {
    try {
      return await this.smartAppService.smartNodeIdentifier();
    } catch(error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @method smartAppIdentifier
   * @description Retrieves the identifier and subscription details for the current Smart Application
   * 
   * This endpoint provides detailed information about the Smart Application itself, including
   * its unique identifier, subscription status, and available features. If a user is authenticated,
   * it will also include user-specific subscription information and access levels.
   * 
   * The subscription details include plan type, expiration dates, feature access, and usage metrics
   * that help determine the application's capabilities and limitations.
   * 
   * @returns {Promise<any>} Object containing Smart Application identifier and subscription details
   * @throws {BadRequestException} If there's an error retrieving application details or subscription information
   * 
   * @example
   * // Example response
   * {
   *   "appId": "smart-app-7890",
   *   "version": "2.3.1",
   *   "subscription": {
   *     "plan": "enterprise",
   *     "status": "active",
   *     "expiresAt": "2024-12-31T23:59:59Z",
   *     "features": ["advanced-analytics", "custom-integrations", "priority-support"],
   *     "usage": {
   *       "apiCalls": {
   *         "used": 12500,
   *         "limit": 100000
   *       }
   *     }
   *   }
   * }
   */
  @ApiOperation({
    summary: 'get subscription status for the logged in user.',
    description: 'This endpoint is only available if the user is authenticated. \
    It will return the subscription details.'
  })
  @ApiOkResponse({
    type: Object,
    status: 200,
    description: "Returns an object containing Smart Application identifier and subscription details"
  })
  @ApiNotFoundResponse({
    description: "Smart Application details or subscription information not found"
  })
  @ApiBadRequestResponse({
    description: "Invalid request or error retrieving Smart Application details"
  })
  @Get('smart-app-identifier')
  async smartAppIdentifier(): Promise<any> {
    try {
      return await this.smartAppService.smartAppIdentifier();
    } catch(error) {
      throw new BadRequestException(error.message);
    }
  }
}
