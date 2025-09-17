/**
 * @module ConfigController
 * @description Controller for configuration endpoints
 * 
 * This module provides REST API endpoints for managing DAO configurations.
 * It handles HTTP requests related to configuration retrieval and exposes
 * the smart_app_dao_configs table data through RESTful endpoints.
 * 
 * The controller uses the ConfigService for business logic and implements
 * proper error handling and HTTP status codes for all endpoints.
 */

import { 
  Controller, 
  Get, 
  Param, 
  NotFoundException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@hsuite/nestjs-swagger';
import { ConfigService } from './config.service';
import { Config } from './entities/config.entity';
import { Error as MongooseError } from 'mongoose';

/**
 * @class ConfigController
 * @description REST API controller for configuration management
 * 
 * The ConfigController provides HTTP endpoints for configuration-related operations.
 * It validates incoming requests, delegates business logic to the ConfigService,
 * and returns properly formatted responses.
 * 
 * All endpoints implement comprehensive error handling and return appropriate
 * HTTP status codes and error messages. The controller uses OpenAPI decorators
 * for automatic API documentation generation.
 */
@ApiTags('configs')
@Controller('configs')
export class ConfigController {
  /**
   * @constructor
   * @description Creates a new instance of ConfigController
   * 
   * @param {ConfigService} configService - Service for configuration business logic operations
   */
  constructor(private readonly configService: ConfigService) {}

  /**
   * @method findAll
   * @description Retrieves all configurations from the smart_app_dao_configs table
   * 
   * This endpoint returns all configuration documents stored in the database.
   * Since typically only one configuration should exist per system, this will
   * usually return a single configuration object in an array.
   * 
   * @returns {Promise<Config[]>} Array of configuration objects
   * 
   * @throws {InternalServerErrorException} If there's an unexpected error during retrieval
   */
  @Get()
  @ApiOperation({ summary: 'Get all configurations' })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved all configurations.',
    type: [Config]
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAll(): Promise<Config[]> {
    try {
      return await this.configService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve configurations');
    }
  }

  /**
   * @method findOne
   * @description Retrieves a specific configuration by ID
   * 
   * This endpoint returns a single configuration document identified by its
   * MongoDB ObjectId. It provides detailed information about a specific
   * configuration including all its properties and metadata.
   * 
   * @param {string} id - The MongoDB ObjectId of the configuration
   * @returns {Promise<Config>} The configuration object
   * 
   * @throws {NotFoundException} If no configuration with the given ID exists
   * @throws {InternalServerErrorException} If there's an unexpected error during retrieval
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a configuration by ID' })
  @ApiParam({ name: 'id', description: 'Configuration ID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved the configuration.',
    type: Config
  })
  @ApiResponse({ status: 404, description: 'Configuration not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findOne(@Param('id') id: string): Promise<Config> {
    try {
      return await this.configService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve configuration');
    }
  }

  /**
   * @method findCurrent
   * @description Retrieves the current active configuration
   * 
   * This endpoint returns the current system configuration. Since the system
   * is designed to have a single active configuration, this endpoint provides
   * quick access to the currently active settings without needing to know
   * the specific configuration ID.
   * 
   * @returns {Promise<Config>} The current active configuration object
   * 
   * @throws {NotFoundException} If no configuration exists in the database
   * @throws {InternalServerErrorException} If there's an unexpected error during retrieval
   */
  @Get('current/active')
  @ApiOperation({ summary: 'Get the current active configuration' })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved the current configuration.',
    type: Config
  })
  @ApiResponse({ status: 404, description: 'No configuration found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findCurrent(): Promise<Config> {
    try {
      return await this.configService.findCurrent();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve current configuration');
    }
  }
} 