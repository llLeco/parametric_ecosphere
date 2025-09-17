import { DynamicModule, Module } from '@nestjs/common';
import { SmartAppController } from './smart-app.controller';
import { SmartAppService } from './smart-app.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';
import { AuthModule } from '@hsuite/auth';
import { IAuth } from '@hsuite/auth-types';
import { SecurityThrottlerModule } from '@hsuite/throttler';
import { IIPFS, IpfsModule } from '@hsuite/ipfs';
import { SmartConfigModule, SmartConfigService } from '@hsuite/smart-config';
import { SmartLedgersModule } from '@hsuite/smart-ledgers';

import authentication from '../config/modules/authentication';
import client from '../config/modules/client';
import smartConfig from '../config/modules/smart-config';
import mongoDb from '../config/settings/mongo-db';
import throttler from '../config/modules/throttler';
import { IThrottler } from '@hsuite/throttler-types';
import redis from '../config/settings/redis';
import { SmartNodeSdkModule } from '@hsuite/smartnode-sdk';
import { IClient } from '@hsuite/client-types';
import { ISmartNetwork } from '@hsuite/smart-network-types';
import { Config } from 'cache-manager';
import { ClientModule, ClientService } from '@hsuite/client';
import ipfs from '../config/modules/ipfs';
import subscription from '../config/modules/subscription';
import { SubscriptionsModule } from '@hsuite/subscriptions';
import { ISubscription } from '@hsuite/subscriptions-types';


import { ConfigsModule } from './modules/config/config.module';
import { RegistryModule } from './modules/registry/registry.module';
import { RulesModule } from './modules/rules/rules.module';
import { TriggersModule } from './modules/triggers/triggers.module';
import { PolicyStatusModule } from './modules/policy-status/policy-status.module';
import { PoolEventsModule } from './modules/pool-events/pool-events.module';
import { CessionModule } from './modules/cession/cession.module';
import { PayoutsModule } from './modules/payouts/payouts.module';
import { PolicyFactoryModule } from './modules/policy-factory/policy-factory.module';
import { FlowModule } from './modules/flow/flow.module';

/**
 * @class SmartAppModule
 * @description Core module for the Smart Application that orchestrates all application components
 * 
 * This module serves as the central hub for the entire Smart Application, integrating all core and optional
 * modules required for the application to function. It handles:
 * 
 * - Configuration management through ConfigModule
 * - Database connectivity via MongooseModule
 * - Caching strategies with Redis
 * - Authentication and authorization
 * - Rate limiting and security features
 * - IPFS integration for decentralized storage
 * - Event handling and scheduling
 * - Static file serving
 * - Smart Node SDK integration
 * - Subscription services (when enabled)
 * 
 * The module uses a dynamic registration pattern to conditionally load modules based on
 * configuration settings, allowing for flexible deployment scenarios.
 * 
 * @example
 * // Bootstrap the application with the SmartAppModule
 * const app = await NestFactory.create(SmartAppModule.register());
 */
@Module({
  imports: [
    /**
     * Global configuration module that loads all application settings
     * from environment variables and configuration files
     */
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: '.smart_app.env',
      load: [
        authentication,
        client,
        mongoDb,
        throttler,
        redis,
        smartConfig,
        ipfs,
        subscription
      ]
    }),
    /**
     * Enables scheduled tasks and cron jobs throughout the application
     */
    ScheduleModule.forRoot(),
    /**
     * Redis-based caching system for improved performance
     * Configured asynchronously based on application settings
     */
    CacheModule.registerAsync<RedisClientOptions & Config>({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisConfig = configService.getOrThrow<RedisClientOptions & Config>('redis');
        return {
          store: await redisStore(redisConfig),
        };
      }
    }),
    /**
     * MongoDB connection for persistent data storage
     * Configured asynchronously based on application settings
     */
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.getOrThrow<{url: string}>('mongoDb').url
      })
    }),
    /**
     * Event emitter for application-wide event handling
     * Enables publish/subscribe patterns throughout the application
     */
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: true,
      removeListener: true,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false
    }),
    /**
     * Static file serving for public assets
     * Serves files from the public directory with appropriate security settings
     */
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '../public'),
      serveRoot: '/public/',
      exclude: ["/api*"],
    })
  ],
  controllers: [
    SmartAppController
  ],
  providers: [
    SmartAppService,
    /**
     * Global cache interceptor for automatic response caching
     * Applies caching to all eligible endpoints based on cache settings
     */
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    }
  ]
})
export class SmartAppModule {
  /**
   * @method register
   * @description Dynamically registers all required and optional modules based on configuration
   * 
   * This static factory method creates a dynamic module configuration that:
   * 1. Includes all core Smart Node modules (IPFS, Throttler, SmartConfig, SmartNodeSDK)
   * 2. Conditionally loads authentication modules if enabled in configuration
   * 3. Conditionally loads subscription services if enabled in configuration
   * 
   * This approach allows for flexible deployment configurations where certain
   * features can be enabled or disabled without code changes.
   * 
   * @returns {DynamicModule} A dynamically configured SmartAppModule with all necessary imports
   */
  static register(): DynamicModule {
    return {
      module: SmartAppModule,
      imports: [
        /**
         * Bull (queue) configuration for background jobs
         */
        BullModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            const redis = configService.getOrThrow<any>('redis');
            const host = redis?.socket?.host || process.env.REDIS_URL;
            const port = redis?.socket?.port || Number(process.env.REDIS_PORT || 6379);
            const password = redis?.password || process.env.REDIS_PASSWORD;
            const db = typeof redis?.database === 'number' ? redis.database : Number(process.env.REDIS_DATABASE || 0);
            const username = redis?.username || process.env.REDIS_USERNAME || 'default';
            return {
              redis: {
                host,
                port,
                password,
                db,
                username
              }
            };
          }
        }),
        // Smart Node - Core Modules
        /**
         * IPFS Module for decentralized storage capabilities
         * Provides file storage and retrieval through IPFS protocol
         */
        IpfsModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            ...configService.getOrThrow<IIPFS.IOptions>('ipfs')
          })
        }),
        /**
         * Security Throttler Module for rate limiting and DDOS protection
         * Prevents abuse of API endpoints by limiting request frequency
         */
        SecurityThrottlerModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            ...configService.getOrThrow<IThrottler.IOptions>('throttler')
          })
        }),
        /**
         * Smart Config Module for network and application configuration
         * Manages application settings and network connectivity parameters
         */
        SmartConfigModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            ...configService.getOrThrow<ISmartNetwork.INetwork.IConfig.IOptions>('smartConfig')
          })
        }),
        /**
         * Smart Ledgers Module for managing blockchain ledger operations
         * Provides unified interface for interacting with multiple blockchain networks
         */
        SmartLedgersModule.forRootAsync({
          isGlobal: true,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            ledgers: configService.getOrThrow<IClient.IOptions>('client').ledgers
          })
        }),
        /**
         * Smart Node SDK Module for interacting with the Hedera network
         * Provides core functionality for blockchain interactions
         */
        SmartNodeSdkModule.forRootAsync({
          imports: [ConfigModule, SmartConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            client: configService.getOrThrow<IClient.IOptions>('client')
          })
        }),
        /**
         * Conditional Authentication Module configuration
         * Only loaded if authentication is enabled in application settings
         */
        ...(
          authentication().enabled ? 
          [AuthModule.forRootAsync({
            imports: [ConfigModule, ClientModule],
            inject: [ConfigService, ClientService],
            useFactory: async (configService: ConfigService, clientService: ClientService) => ({
              ...configService.getOrThrow<IAuth.IConfiguration.IAuthentication>('authentication')
            }),
            config: {
              passport: authentication().commonOptions.passport,
              module: 'web3',
              options: {
                  confirmation_required: authentication().web2Options.confirmation_required,
                  admin_only: authentication().web2Options.admin_only,
                  enable_2fa: authentication().web2Options.twilioOptions.enabled
              }                
            }
          })] : []
        ),
        /**
         * Conditional Subscription Module configuration
         * Only loaded if subscription services are enabled in application settings
         * Provides functionality for managing user subscriptions, token gating, and issuer services
         */
        ...(
          subscription().enabled ? 
          [SubscriptionsModule.forRootAsync({
            imports: [ConfigModule, SmartConfigModule],
            inject: [ConfigService, SmartConfigService],
            jwt: authentication().commonOptions.jwt,
            enableIssuer: subscription().issuer.enabled,
            enableTokenGate: subscription().tokenGate.enabled,
            useFactory: async (
              configService: ConfigService,
              smartConfigService: SmartConfigService
            ) => ({
              subscription: {
                ...configService.getOrThrow<ISubscription.IConfig.IOptions>('subscription'),
                utilities: []
              },
              bull: {
                redis: configService.getOrThrow<ISubscription.IConfig.IRedis>('subscription.issuer.options.redis'),
                defaultJobOptions: {
                  attempts: 5,
                  backoff: {
                    type: 'exponential',
                    delay: 1000
                  },
                  removeOnComplete: true,
                  removeOnFail: false
                }
              }
            })
          })] : []
        ),      
  
     
        
 
    
        ConfigsModule,
        RegistryModule,
        RulesModule,
        TriggersModule,
        PolicyStatusModule,
        PoolEventsModule,
        CessionModule,
        PayoutsModule,
        PolicyFactoryModule,
        FlowModule
      ],
      providers: []
    };
  }
}
