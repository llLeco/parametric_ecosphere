/**
 * @module configs
 * @description Configs module for database schema management
 * 
 * This module handles database configs and provides CLI commands for managing them.
 * It registers the config commands with the NestJS dependency injection system.
 */

import { Module } from '@nestjs/common';
import { ConfigCommand } from './config-cli';
import { ConfigController } from './config.controller';
import { ConfigService as AppConfigService } from './config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Config, ConfigSchema } from './entities/config.entity';
import { SmartLedgersService } from '@hsuite/smart-ledgers';
import { ConfigService } from '@nestjs/config';
import { IClient } from '@hsuite/client-types';

/**
 * @class ConfigsModule
 * @description Module for database configs
 * 
 * Registers config-related components, commands, and HTTP endpoints:
 * - ConfigCommand: CLI command for running configs
 * - ConfigController: REST API endpoints for configuration management
 * - AppConfigService: Business logic service for configuration operations
 * 
 * Imports:
 * - MongooseModule: Provides Config model for database operations
 * 
 * Providers:
 * - SmartLedgersService: Custom provider configured with client ledger options
 */
@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Config.name, 
      schema: ConfigSchema 
    }]),
  ],
  controllers: [ConfigController],
  providers: [
    ConfigCommand,
    AppConfigService,
    {
      provide: SmartLedgersService,
      useFactory: (configService: ConfigService) => {
        const clientConfig = configService.getOrThrow<IClient.IOptions>('client');
        return new SmartLedgersService({ ledgers: clientConfig.ledgers });
      },
      inject: [ConfigService],
    },
  ],
  exports: [ConfigCommand, AppConfigService],
})
export class ConfigsModule {} 