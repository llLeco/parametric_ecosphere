import { NestFactory } from '@nestjs/core';
import { setupSwagger } from './common/swagger/swagger';
import * as csurf from 'csurf';
import helmet from 'helmet';
import * as bodyParser from 'body-parser';
const cookieParser = require('cookie-parser');
const compression = require('compression');
import { CustomThrottlerGuard } from '@hsuite/throttler';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { SmartAppService } from './smart-app.service';
import { SmartAppModule } from './smart-app.module';
import * as express from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * @module main
 * @description Main application bootstrap process for the Smart Application
 * @category Core
 * 
 * This module initializes and configures the NestJS application with all necessary
 * middleware, security features, and API documentation. It handles:
 * 
 * - Application instantiation and module registration
 * - Rate limiting and DDOS protection via CustomThrottlerGuard
 * - Request parsing and body handling
 * - Security features (CORS, Helmet, etc.)
 * - API documentation via Swagger
 * - Graceful shutdown handling
 * - Server clustering for performance optimization
 */

/**
 * @function bootstrap
 * @description Initializes and configures the NestJS application
 * 
 * This function performs the complete application bootstrap process:
 * 1. Creates the NestJS application instance with the SmartAppModule
 * 2. Configures rate limiting middleware for API routes
 * 3. Sets up request parsing, CORS, and security middleware
 * 4. Enables compression and shutdown hooks
 * 5. Configures Swagger documentation
 * 6. Starts the HTTP server
 * 
 * @returns {Promise<any>} The configured NestJS application instance
 */
async function bootstrap() {
  // creating app instance...
  const app = await NestFactory.create(SmartAppModule.register());

  // using custom throttler guard, to avoid DDOS attacks on /api and /public routes...
  const throttlerGuard = app.get(CustomThrottlerGuard);
  app.use(async function (req, res, next) {
    let executionContext = new ExecutionContextHost(
      [req, res], app.get(SmartAppService), app.get(SmartAppService)
    );

    if(req.originalUrl.includes('/api') || req.originalUrl.includes('/public')) {
      try {
        await throttlerGuard.handleCustomRequest(
          executionContext, 
          app.get(ConfigService).get('throttler.settings.limit'),
          app.get(ConfigService).get('throttler.settings.ttl')
        );
        next();
      } catch(error) {
        res.status(429).json({
          statusCode: 429,
          message: 'Too Many Requests',
        });
      }
    } else {
      next();
    }
 });

  // enabling body parser...
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // enabling cors...
  app.enableCors({credentials: true, origin: true});
  // making use of CSRF Protection...
  app.use(cookieParser());

  // csurf seems not to be working when using passport/redis/jwt...
  // app.use(csurf({ cookie: true }));

  // making use of Helmet...
  app.use(helmet({
    crossOriginResourcePolicy: false
  }));

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  // enabling compression server side...
  app.use(compression());

  // Configure Swagger documentation centrally
  setupSwagger(app);
 
  // start listening on the port...
  await app.listen(process.env.PORT || 3000);

  // returning app instance...
  return app;
}

bootstrap();