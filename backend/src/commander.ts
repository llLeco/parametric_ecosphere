/**
 * @module commander
 * @description Command-line interface for the Smart Application
 * @category Core
 * 
 * This module provides a command-line interface (CLI) for the Smart Application,
 * allowing administrative tasks, maintenance operations, and network interactions
 * to be performed through a terminal interface. It leverages nest-commander to create
 * CLI commands that integrate seamlessly with the NestJS module structure.
 * 
 * The CLI architecture follows the NestJS dependency injection pattern, ensuring
 * that all services and configurations are properly initialized and available to
 * command handlers. This enables complex operations like database migrations,
 * network configurations, and subscription management to be executed with proper
 * access to application resources.
 * 
 * The CLI supports the following log levels for detailed operational visibility:
 * - verbose: Comprehensive debugging information including method calls and data flows
 * - debug: General debugging information useful for development and troubleshooting
 * - warn: Warning messages indicating potential issues that don't prevent execution
 * - error: Critical error messages for issues that may impact functionality
 * 
 * Available commands include:
 * - migration: Run database migrations to update schema structures
 * - config: View and modify application configuration settings
 * - network: Interact with Hedera network services and configurations
 * - subscription: Manage subscription plans and user access levels
 * - cache: Control Redis cache operations including flush and inspection
 * 
 * @example
 * // Run database migrations
 * $ node dist/apps/smart-app/src/commander.js migration:run
 * 
 * // View current network configuration
 * $ node dist/apps/smart-app/src/commander.js config:view --section=network
 */
import { SmartAppModule } from './smart-app.module';
import { CommandFactory } from 'nest-commander';
import { Module } from '@nestjs/common';

/**
 * @class CliModule
 * @description A wrapper module for CLI operations
 * @category Core
 * 
 * This module serves as the entry point for the command-line interface,
 * importing the registered SmartAppModule to ensure all dependencies,
 * services, and configurations are properly initialized when running CLI commands.
 * 
 * The module leverages NestJS's dependency injection system to make all
 * application services available to command handlers, allowing them to
 * perform complex operations with full access to application resources.
 * 
 * By using a dedicated module for CLI operations, we maintain separation
 * of concerns between the web application and command-line interfaces
 * while sharing the core application logic and configuration.
 */
@Module({
  imports: [SmartAppModule.register()],
})
class CliModule {}

/**
 * @function bootstrap
 * @description Bootstraps the command-line interface
 * @category Core
 * 
 * This function initializes the command-line interface using nest-commander's
 * CommandFactory. It configures the logging system and handles the application
 * lifecycle, including graceful shutdown on completion or error conditions.
 * 
 * The bootstrap process:
 * 1. Initializes the NestJS application context with CLI module
 * 2. Configures the logger with appropriate verbosity levels
 * 3. Runs the command specified in command-line arguments
 * 4. Handles successful completion with clean process exit
 * 5. Catches and logs any errors during execution
 * 
 * @returns {Promise<void>} A promise that resolves when the CLI command completes
 * @throws {Error} If command initialization or execution fails
 */
async function bootstrap() {
  try {
    // Run the CLI app with CommandFactory using the wrapper module
    // that properly imports the registered SmartAppModule
    await CommandFactory.run(CliModule, {
      logger: ['verbose', 'debug', 'warn', 'error'],
    });
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

// bootstrapping the app...
bootstrap();