/**
 * @module ConfigService
 * @description Service implementing business logic for configuration operations
 * 
 * The ConfigService implements the business logic for managing
 * DAO configurations. It serves as an intermediary between the
 * controllers and the data layer, handling validation and orchestration
 * of configuration-related operations.
 * 
 * This service handles direct database operations for configuration
 * management including retrieval and validation of configuration data.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Config, ConfigDocument } from './entities/config.entity';

/**
 * @class ConfigService
 * @description Service for configuration business logic operations
 * 
 * The ConfigService provides business logic methods for managing
 * DAO configurations. It handles direct database operations through
 * the Mongoose model and implements proper error handling and validation.
 */
@Injectable()
export class ConfigService {
  /**
   * @constructor
   * @description Creates a new instance of ConfigService
   * 
   * @param {Model<ConfigDocument>} configModel - Mongoose model for Config documents
   */
  constructor(
    @InjectModel(Config.name) private configModel: Model<ConfigDocument>
  ) {}

  /**
   * @method findAll
   * @description Retrieves all configurations from the database
   * 
   * This method fetches all configuration documents from the smart_app_dao_configs
   * collection. Since typically only one configuration should exist, this method
   * can be used to retrieve the current active configuration.
   * 
   * @returns {Promise<Config[]>} Array of configuration documents
   */
  async findAll(): Promise<Config[]> {
    return this.configModel.find().exec();
  }

  /**
   * @method findOne
   * @description Retrieves a single configuration by ID
   * 
   * This method fetches a specific configuration document by its MongoDB ObjectId.
   * It throws a NotFoundException if no configuration with the given ID exists.
   * 
   * @param {string} id - The MongoDB ObjectId of the configuration to retrieve
   * @returns {Promise<Config>} The configuration document
   * @throws {NotFoundException} If no configuration with the given ID exists
   */
  async findOne(id: string): Promise<Config> {
    const config = await this.configModel.findById(id).exec();
    if (!config) {
      throw new NotFoundException(`Configuration with ID ${id} not found`);
    }
    return config;
  }

  /**
   * @method findCurrent
   * @description Retrieves the current active configuration
   * 
   * This method fetches the first (and typically only) configuration document
   * from the database. Since the system is designed to have a single active
   * configuration, this method returns the current system configuration.
   * 
   * @returns {Promise<Config>} The current configuration document
   * @throws {NotFoundException} If no configuration exists in the database
   */
  async findCurrent(): Promise<Config> {
    const config = await this.configModel.findOne().exec();
    if (!config) {
      throw new NotFoundException('No configuration found in the database');
    }
    return config;
  }
} 