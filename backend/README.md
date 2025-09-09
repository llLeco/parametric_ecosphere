# HSuite Smart App - Enterprise Hedera Application Framework

[![License: PROPRIETARY](https://img.shields.io/badge/License-PROPRIETARY-red.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](package.json)
[![Node.js](https://img.shields.io/badge/node.js-22.x-green.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-e0234e.svg)](https://nestjs.com/)
[![Hedera](https://img.shields.io/badge/Hedera-2.62.0-purple.svg)](https://hedera.com/)

> A comprehensive, enterprise-grade NestJS boilerplate for building scalable applications on the Hedera Hashgraph network. Part of the HSuite ecosystem of decentralized applications and smart contract engines.

## 🌟 Overview

The HSuite Smart App is a production-ready, feature-rich boilerplate designed for developers building sophisticated applications on the Hedera network. It provides a solid foundation with pre-configured modules, services, and examples for common blockchain operations, authentication, monitoring, and much more.

### Key Highlights

- **🏗️ Enterprise Architecture**: Built on NestJS with modular, scalable design patterns
- **🔗 Hedera Native**: Deep integration with Hedera Hashgraph SDK and services
- **🛡️ Security First**: Multi-layer security with rate limiting, authentication, and protection
- **📊 Production Ready**: Comprehensive monitoring, logging, and observability
- **🔄 Event-Driven**: Robust event handling and real-time capabilities
- **🌐 Multi-Network**: Support for testnet, mainnet, and private networks
- **📦 Modular Design**: Conditional loading of features based on configuration

## ✨ Features

### Core Framework
- 🏗️ **NestJS Framework**: Scalable server-side applications with TypeScript
- 🔗 **Hedera Integration**: Complete Hedera Hashgraph SDK integration
- 🗄️ **MongoDB & Mongoose**: Robust database layer with schema validation
- 🔄 **Redis Caching**: High-performance caching and session management
- 📡 **WebSocket Support**: Real-time communication capabilities
- 🔄 **Event Emitter**: Application-wide event handling system

### Security & Authentication
- 🔐 **Multi-Auth Support**: JWT, API keys, and custom authentication strategies
- 🛡️ **Rate Limiting**: DDOS protection with configurable throttling
- 🔒 **Security Headers**: Helmet integration for HTTP security
- 🍪 **Session Management**: Secure cookie-based sessions with Redis
- 🚨 **CSRF Protection**: Cross-site request forgery protection
- 🔑 **2FA Support**: Two-factor authentication via Twilio

### Monitoring & Observability
- 📊 **OpenTelemetry**: Complete observability with traces and metrics
- 📈 **Prometheus Metrics**: Application and custom metrics collection
- 🔍 **Jaeger Tracing**: Distributed tracing for performance monitoring
- 📝 **Structured Logging**: Comprehensive logging with context
- 🏥 **Health Checks**: Application health monitoring endpoints

### External Integrations
- 📨 **Email Services**: Nodemailer integration for transactional emails
- 📱 **SMS Notifications**: Twilio integration for SMS alerts
- 🤖 **Discord Webhooks**: Discord integration for notifications
- 🐦 **Twitter API**: Social media integration capabilities
- 📦 **IPFS Storage**: Decentralized file storage and retrieval
- 🔄 **Background Jobs**: Bull queue system for async processing

### Development & Testing
- 📝 **API Documentation**: Auto-generated Swagger/OpenAPI docs
- 🧪 **Testing Framework**: Jest with unit and e2e testing support
- 📚 **Code Documentation**: Compodoc integration for code docs
- 🔧 **Development Tools**: Hot reload, debugging, and linting
- 🚀 **Docker Support**: Containerization for easy deployment

## 🛠️ Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js**: Version 22.x or higher
- **Yarn**: Version 1.22.x (package manager)
- **MongoDB**: Database server (local or cloud)
- **Redis**: Caching and session store
- **IPFS Node**: Optional, for decentralized storage
- **Git**: Version control system

### Optional Services
- **Discord Bot**: For notification integrations
- **Twilio Account**: For SMS and 2FA services
- **Twitter API**: For social media features
- **Jaeger**: For distributed tracing (can use SaaS)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/HbarSuite/smart-engines.git
cd smart-engines

# Install dependencies
yarn install

# Prepare Smart App
yarn prepare:smart_app
```

### 2. Environment Configuration

```bash
# Copy environment template
cp apps/smart-app/.smart_app.env.example apps/smart-app/.smart_app.env

# Edit configuration
nano apps/smart-app/.smart_app.env
```

### 3. Start Development Services

```bash
# Start MongoDB (if using Docker)
yarn build:docker:mongodb

# Start Redis (if using Docker)
yarn build:docker:redis

# Start IPFS (optional, if using Docker)
yarn build:docker:ipfs
```

### 4. Launch Application

```bash
# Development mode with hot reload
yarn start:dev smart-app

# Production mode
yarn start:prod smart-app

# Debug mode
yarn start:debug smart-app
```

### 5. Access Services

- **API Documentation**: http://localhost:8888/api
- **Health Check**: http://localhost:8888/health
- **Metrics**: http://localhost:8888/metrics

## 🏗️ Project Architecture

```
apps/smart-app/
├── src/
│   ├── modules/                 # Feature modules
│   │   ├── accounts/           # Hedera account operations
│   │   ├── topics/             # Consensus service (HCS)
│   │   └── tokens/             # Token service (HTS)
│   ├── sockets/                # WebSocket handlers
│   ├── config/                 # Configuration modules
│   │   ├── modules/           # Feature configurations
│   │   └── settings/          # Service settings
│   ├── smart-app.controller.ts # Main API controller
│   ├── smart-app.service.ts   # Core business logic
│   ├── smart-app.module.ts    # Root application module
│   ├── main.ts                # Application bootstrap
│   └── commander.ts           # CLI commands
├── test/                       # Test suites
├── config/                     # Configuration templates
└── package.json.template      # Dependencies template
```

### Core Modules Architecture

```typescript
/**
 * Smart App Module Structure
 * 
 * @SmartAppModule (Root)
 * ├── @ConfigModule (Global configuration)
 * ├── @CacheModule (Redis caching)
 * ├── @MongooseModule (Database)
 * ├── @EventEmitterModule (Events)
 * ├── @ServeStaticModule (Static files)
 * ├── @SecurityThrottlerModule (Rate limiting)
 * ├── @IpfsModule (Decentralized storage)
 * ├── @SmartConfigModule (Network config)
 * ├── @SmartLedgersModule (Multi-ledger support)
 * ├── @SmartNodeSdkModule (Hedera SDK)
 * ├── @AuthModule (Authentication - conditional)
 * ├── @SubscriptionsModule (Subscriptions - conditional)
 * └── Feature Modules:
 *     ├── @TopicsModule (HCS demonstrations)
 *     ├── @AccountsModule (Account operations)
 *     └── @TokensModule (HTS demonstrations)
 */
```

## ⚙️ Configuration

The application uses a hierarchical configuration system with environment variables and configuration modules.

### Environment Variables

```bash
# Core Application Settings
NODE_ENV=testnet                    # Environment: testnet | mainnet
CLIENT_ENV=local-node              # Client environment
NETWORK=public                     # Network type: public | private
PORT=8888                          # Application port
IS_DEBUG_MODE=true                 # Enable debug logging

# Authentication & Security
SESSION_SECRET=your-session-secret  # Session encryption key
VALID_DURATION=30                  # Token validity in days

# Hedera Network Configuration
DEV_NODE_ID=0.0.3                  # Testnet operator ID
DEV_NODE_PRIVATE_KEY=302e...        # Testnet private key
DEV_NODE_PUBLIC_KEY=302a...         # Testnet public key

# Database Configuration
DEV_MONGO_DB=mongodb://localhost:27017/smart-app
PROD_MONGO_DB=mongodb://prod-server/smart-app

# Redis Configuration
REDIS_URL=127.0.0.1                # Redis host
REDIS_PORT=6379                    # Redis port
REDIS_PASSWORD=                    # Redis password
REDIS_USERNAME=default             # Redis username
REDIS_DATABASE=0                   # Redis database

# Smart Registry
SMART_REGISTRY_URL=http://smart_registry-smart_node-1:1234

# Subscription Services (Optional)
DEV_SUBSCRIPTIONS_TOKEN_ID=0.0.123456
PROD_SUBSCRIPTIONS_TOKEN_ID=0.0.789012
SUBSCRIPTIONS_CID=QmYourIPFSHash
```

### Configuration Modules

The application uses modular configuration with TypeScript configuration files:

```typescript
// config/modules/authentication.ts
export default () => ({
  enabled: true,
  commonOptions: {
    jwt: {
      secret: process.env.SESSION_SECRET,
      expiresIn: '7d'
    }
  }
});

// config/modules/client.ts
export default () => ({
  ledgers: {
    hedera: {
      network: process.env.CLIENT_ENV,
      operator: {
        accountId: process.env.DEV_NODE_ID,
        privateKey: process.env.DEV_NODE_PRIVATE_KEY
      }
    }
  }
});
```

## 🔧 Available Scripts

### Development Scripts
```bash
# Start development server with hot reload
yarn start:dev smart-app

# Start with debugging enabled
yarn start:debug smart-app

# Run in production mode
yarn start:prod smart-app
```

### Testing Scripts
```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:cov

# Run end-to-end tests
yarn test:e2e
```

### Build Scripts
```bash
# Build application
yarn build smart-app
```

### Docker Scripts
```bash
# Build and start MongoDB
yarn build:docker:mongodb

# Build and start Redis
yarn build:docker:redis

# Build and start IPFS
yarn build:docker:ipfs

# Docker maintenance
yarn docker:auto-maintain
```

### Utility Scripts
```bash
# Format code
yarn format

# Lint and fix code
yarn lint

# Generate documentation
yarn generate:compodocs

# Update API schemas
yarn update:api-schemas
```

## 💻 Development Guide

### Creating a New Feature Module

1. **Generate Module Structure**:
```bash
mkdir -p src/modules/my-feature/{dto,schemas,interfaces}
```

2. **Create the Module**:
```typescript
// src/modules/my-feature/my-feature.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MyFeatureController } from './my-feature.controller';
import { MyFeatureService } from './my-feature.service';
import { MyFeature, MyFeatureSchema } from './schemas/my-feature.schema';

/**
 * @module MyFeatureModule
 * @description Module for managing my-feature functionality
 * 
 * This module provides:
 * - CRUD operations for my-feature entities
 * - Integration with Hedera network
 * - Caching and performance optimization
 * - Event emission for state changes
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MyFeature.name, schema: MyFeatureSchema }
    ])
  ],
  controllers: [MyFeatureController],
  providers: [MyFeatureService],
  exports: [MyFeatureService],
})
export class MyFeatureModule {}
```

3. **Create the Service**:
```typescript
// src/modules/my-feature/my-feature.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MyFeature } from './schemas/my-feature.schema';
import { CreateMyFeatureDto } from './dto/create-my-feature.dto';

/**
 * @class MyFeatureService
 * @description Service for managing my-feature business logic
 * 
 * Provides comprehensive functionality for:
 * - Creating and managing my-feature entities
 * - Integrating with Hedera network operations
 * - Emitting events for state changes
 * - Caching frequently accessed data
 * 
 * @example
 * ```typescript
 * const feature = await myFeatureService.create({
 *   name: 'Example Feature',
 *   description: 'A sample feature'
 * });
 * ```
 */
@Injectable()
export class MyFeatureService {
  private readonly logger = new Logger(MyFeatureService.name);

  constructor(
    @InjectModel(MyFeature.name) 
    private myFeatureModel: Model<MyFeature>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Creates a new my-feature entity
   * @param createDto - Data transfer object for creation
   * @returns Promise<MyFeature> - Created entity
   */
  async create(createDto: CreateMyFeatureDto): Promise<MyFeature> {
    this.logger.debug(`Creating new feature: ${createDto.name}`);
    
    const created = new this.myFeatureModel(createDto);
    const result = await created.save();
    
    // Emit event for other modules to react
    this.eventEmitter.emit('my-feature.created', result);
    
    return result;
  }

  /**
   * Retrieves all my-feature entities with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @returns Promise<MyFeature[]> - Array of entities
   */
  async findAll(page: number = 1, limit: number = 10): Promise<MyFeature[]> {
    const skip = (page - 1) * limit;
    return this.myFeatureModel.find().skip(skip).limit(limit).exec();
  }

  /**
   * Retrieves a single my-feature entity by ID
   * @param id - Entity identifier
   * @returns Promise<MyFeature | null> - Entity or null if not found
   */
  async findOne(id: string): Promise<MyFeature | null> {
    return this.myFeatureModel.findById(id).exec();
  }
}
```

4. **Create the Controller**:
```typescript
// src/modules/my-feature/my-feature.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MyFeatureService } from './my-feature.service';
import { CreateMyFeatureDto } from './dto/create-my-feature.dto';
import { JwtAuthGuard } from '@hsuite/auth';

/**
 * @class MyFeatureController
 * @description RESTful API controller for my-feature operations
 * 
 * Provides endpoints for:
 * - Creating new my-feature entities
 * - Retrieving my-feature data with pagination
 * - Individual entity retrieval
 * 
 * All endpoints include:
 * - Swagger documentation
 * - Response caching where appropriate
 * - Authentication guards for protected routes
 */
@ApiTags('My Feature')
@Controller('my-feature')
@UseInterceptors(CacheInterceptor)
export class MyFeatureController {
  constructor(private readonly myFeatureService: MyFeatureService) {}

  /**
   * Creates a new my-feature entity
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new my-feature entity' })
  @ApiResponse({ status: 201, description: 'Entity created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createDto: CreateMyFeatureDto) {
    return this.myFeatureService.create(createDto);
  }

  /**
   * Retrieves all my-feature entities with pagination
   */
  @Get()
  @ApiOperation({ summary: 'Retrieve all my-feature entities' })
  @ApiResponse({ status: 200, description: 'Entities retrieved successfully' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.myFeatureService.findAll(page, limit);
  }

  /**
   * Retrieves a single my-feature entity by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a my-feature entity by ID' })
  @ApiResponse({ status: 200, description: 'Entity retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async findOne(@Param('id') id: string) {
    return this.myFeatureService.findOne(id);
  }
}
```

5. **Register in Main Module**:
```typescript
// src/smart-app.module.ts (in the register method)
import { MyFeatureModule } from './modules/my-feature/my-feature.module';

// Add to imports array
MyFeatureModule,
```

### Working with SmartNode SDK

The Smart App leverages the `@hsuite/smartnode-sdk` for all Hedera network operations. Here are real-world examples from the codebase:

#### Service Setup Pattern
```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SmartNodeSdkService } from '@hsuite/smartnode-sdk';
import { SmartConfigService } from '@hsuite/smart-config';
import { Transaction, PrivateKey, Client } from '@hashgraph/sdk';
import { ChainType, ILedger, SmartLedgersService } from '@hsuite/smart-ledgers';
import { IHashgraph } from '@hsuite/hashgraph-types';

@Injectable()
export class MyHederaService implements OnModuleInit {
  private client: Client;
  private operator: IHashgraph.IOperator;
  private ledger: ILedger;

  constructor(
    private readonly smartConfigService: SmartConfigService,
    private readonly smartNodeSdkService: SmartNodeSdkService,
    private readonly smartLedgersService: SmartLedgersService
  ) {
    this.operator = this.smartConfigService.getOperator();
  }

  async onModuleInit() {
    this.ledger = this.smartLedgersService.getAdapter(ChainType.HASHGRAPH).getLedger();
    this.client = await this.ledger.getClient();
  }
}
```

#### Token Operations with SmartNode SDK
```typescript
/**
 * Create a fungible token using SmartNode SDK
 */
async createToken(params: {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: number;
}): Promise<string> {
  // Add validator for transaction validation
  const validatorConsensusTimestamp = await this.smartNodeSdkService.sdk.smartNode.validators
    .addTokenValidator(exampleTokensValidator);

  // Generate transaction bytes using SmartNode SDK
  const createTokenTxBytes = await this.smartNodeSdkService.sdk.hashgraph.hts.createToken({
    ...params,
    validatorConsensusTimestamp
  });

  // Convert bytes to transaction and sign
  const createTokenTx = Transaction.fromBytes(
    new Uint8Array(Buffer.from(createTokenTxBytes))
  );
  
  const signedTx = await createTokenTx.sign(
    PrivateKey.fromString(this.operator.privateKey)
  );
  
  // Execute transaction
  const txResponse = await signedTx.execute(this.client);
  const receipt = await txResponse.getReceipt(this.client);
  
  return receipt.tokenId.toString();
}

/**
 * Mint additional tokens
 */
async mintTokens(params: {
  tokenId: string;
  amount: number;
}): Promise<string> {
  const mintTxBytes = await this.smartNodeSdkService.sdk.hashgraph.hts.mintToken(params);
  
  const mintTx = Transaction.fromBytes(
    new Uint8Array(Buffer.from(mintTxBytes))
  );
  
  const signedTx = await mintTx.sign(
    PrivateKey.fromString(this.operator.privateKey)
  );
  
  const txResponse = await signedTx.execute(this.client);
  return txResponse.transactionId.toString();
}

/**
 * Get token information
 */
async getTokenInfo(tokenId: string): Promise<TokenInfo> {
  return await this.smartNodeSdkService.sdk.hashgraph.hts.getTokenInfo(tokenId);
}
```

#### Topic Operations with SmartNode SDK
```typescript
/**
 * Create a Hedera Consensus Service topic
 */
async createTopic(params: {
  memo?: string;
}): Promise<string> {
  const validatorConsensusTimestamp = await this.smartNodeSdkService.sdk.smartNode.validators
    .addConsensusValidator(exampleTopicsValidator);

  // Generate transaction bytes using SmartNode SDK
  const createTopicTxBytes = await this.smartNodeSdkService.sdk.hashgraph.hcs.createTopic({
    ...params,
    validatorConsensusTimestamp
  });

  const createTopicTx = Transaction.fromBytes(
    new Uint8Array(Buffer.from(createTopicTxBytes))
  );
  
  const signedTx = await createTopicTx.sign(
    PrivateKey.fromString(this.operator.privateKey)
  );
  
  const txResponse = await signedTx.execute(this.client);
  const receipt = await txResponse.getReceipt(this.client);
  
  return receipt.topicId.toString();
}

/**
 * Submit a message to a topic
 */
async submitMessage(topicId: string, params: {
  message: string;
}): Promise<string> {
  const submitMsgTxBytes = await this.smartNodeSdkService.sdk.hashgraph.hcs.submitMessage(
    topicId, 
    params
  );
  
  const submitMsgTx = Transaction.fromBytes(
    new Uint8Array(Buffer.from(submitMsgTxBytes))
  );
  
  const signedTx = await submitMsgTx.sign(
    PrivateKey.fromString(this.operator.privateKey)
  );
  
  const txResponse = await signedTx.execute(this.client);
  return txResponse.transactionId.toString();
}
```

#### Account Operations with SmartNode SDK
```typescript
/**
 * Create a new Hedera account
 */
async createAccount(params: {
  initialBalance?: number;
}): Promise<string> {
  const validatorConsensusTimestamp = await this.smartNodeSdkService.sdk.smartNode.validators
    .addAccountValidator(exampleAccountsValidator);

  const createAccountTxBytes = await this.smartNodeSdkService.sdk.hashgraph.accounts.createAccount({
    ...params,
    validatorConsensusTimestamp
  });

  const createAccountTx = Transaction.fromBytes(
    new Uint8Array(Buffer.from(createAccountTxBytes))
  );
  
  const signedTx = await createAccountTx.sign(
    PrivateKey.fromString(this.operator.privateKey)
  );
  
  const txResponse = await signedTx.execute(this.client);
  const receipt = await txResponse.getReceipt(this.client);
  
  return receipt.accountId.toString();
}

/**
 * Transfer HBAR between accounts
 */
async transferHbar(params: {
  toAccount: string;
  amount: number;
}): Promise<string> {
  const transferTxBytes = await this.smartNodeSdkService.sdk.hashgraph.accounts.transferHbar(params);
  
  const transferTx = Transaction.fromBytes(
    new Uint8Array(Buffer.from(transferTxBytes))
  );
  
  const signedTx = await transferTx.sign(
    PrivateKey.fromString(this.operator.privateKey)
  );
  
  const txResponse = await signedTx.execute(this.client);
  return txResponse.transactionId.toString();
}
```

#### SmartNode SDK Key Features

The SmartNode SDK provides several advantages over direct Hedera SDK usage:

- **🔒 Validator Integration**: All transactions include validator consensus timestamps
- **📦 Pre-built Transaction Bytes**: SDK generates optimized transaction bytes
- **🔧 Type Safety**: Full TypeScript interfaces for all operations
- **⚡ Performance**: Optimized for Smart Node network operations
- **🛡️ Security**: Built-in transaction validation and signing patterns

#### Configuration Integration
```typescript
// The SmartNode SDK automatically uses your Smart App configuration
const operator = this.smartConfigService.getOperator();
// Returns: { accountId: '0.0.12345', privateKey: '302e...', publicKey: '302a...' }

const ledger = this.smartLedgersService.getAdapter(ChainType.HASHGRAPH).getLedger();
const client = await ledger.getClient();
// Returns configured Hedera client for your network environment
```

## 🧪 Testing

### Unit Testing

```typescript
// my-feature.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MyFeatureService } from './my-feature.service';
import { MyFeature } from './schemas/my-feature.schema';

describe('MyFeatureService', () => {
  let service: MyFeatureService;
  let mockModel: any;
  let mockEventEmitter: any;

  beforeEach(async () => {
    mockModel = {
      new: jest.fn().mockResolvedValue({}),
      constructor: jest.fn().mockResolvedValue({}),
      find: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyFeatureService,
        {
          provide: getModelToken(MyFeature.name),
          useValue: mockModel,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<MyFeatureService>(MyFeatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new feature and emit event', async () => {
      const createDto = { name: 'Test Feature', description: 'Test' };
      const savedFeature = { ...createDto, _id: 'test-id' };

      mockModel.prototype.save = jest.fn().mockResolvedValue(savedFeature);
      mockModel.constructor.mockImplementation(() => ({
        save: mockModel.prototype.save,
      }));

      const result = await service.create(createDto);

      expect(result).toEqual(savedFeature);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'my-feature.created',
        savedFeature,
      );
    });
  });
});
```

### E2E Testing

```typescript
// my-feature.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SmartAppModule } from '../src/smart-app.module';

describe('MyFeatureController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SmartAppModule.register()],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/my-feature (GET)', () => {
    return request(app.getHttpServer())
      .get('/my-feature')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/my-feature (POST)', () => {
    return request(app.getHttpServer())
      .post('/my-feature')
      .send({
        name: 'Test Feature',
        description: 'E2E Test Feature',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toBe('Test Feature');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t smart-app .

# Run with environment file
docker run --env-file .smart_app.env -p 8888:8888 smart-app

# Using docker-compose
docker-compose up -d
```

### Docker Compose Example:

```yaml
# docker-compose.yml
version: '3.8'
services:
  smart-app:
    build: .
    ports:
      - "8888:8888"
    environment:
      - NODE_ENV=production
      - PORT=8888
    depends_on:
      - mongodb
      - redis

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:latest
    ports:
      - "6379:6379"

volumes:
  mongodb_data:
```

### Environment-Specific Configurations

#### Production Configuration:
```bash
NODE_ENV=mainnet
CLIENT_ENV=mainnet
NETWORK=public
IS_DEBUG_MODE=false
PROD_MONGO_DB=mongodb://prod-cluster/smart-app
PROD_NODE_ID=0.0.your-mainnet-account
PROD_NODE_PRIVATE_KEY=your-mainnet-private-key
```

#### Staging Configuration:
```bash
NODE_ENV=testnet
CLIENT_ENV=testnet
NETWORK=public
IS_DEBUG_MODE=true
DEV_MONGO_DB=mongodb://staging-cluster/smart-app
DEV_NODE_ID=0.0.your-testnet-account
DEV_NODE_PRIVATE_KEY=your-testnet-private-key
```

## 📊 Monitoring & Observability

### Metrics Collection

The application automatically collects metrics using Prometheus:

```typescript
// Custom metrics example
import { Injectable } from '@nestjs/common';
import { Counter, Histogram, register } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'status_code'],
  });

  private readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route'],
  });

  constructor() {
    register.registerMetric(this.httpRequestsTotal);
    register.registerMetric(this.httpRequestDuration);
  }

  incrementHttpRequests(method: string, statusCode: string) {
    this.httpRequestsTotal.inc({ method, status_code: statusCode });
  }

  observeHttpDuration(method: string, route: string, duration: number) {
    this.httpRequestDuration.observe({ method, route }, duration);
  }
}
```

### Health Checks

Access health information at `/health`:

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "hedera": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "hedera": { "status": "up" }
  }
}
```

### Logging

The application uses structured logging with contextual information:

```typescript
import { Logger } from '@nestjs/common';

export class MyService {
  private readonly logger = new Logger(MyService.name);

  async performOperation(data: any) {
    this.logger.log('Starting operation', { 
      operation: 'performOperation',
      dataSize: data.length,
      timestamp: new Date().toISOString()
    });

    try {
      // Operation logic
      this.logger.debug('Operation completed successfully');
    } catch (error) {
      this.logger.error('Operation failed', error.stack, {
        operation: 'performOperation',
        error: error.message
      });
      throw error;
    }
  }
}
```

## 🔧 Troubleshooting

### Common Issues

#### MongoDB Connection Issues
```bash
# Check MongoDB status
docker ps | grep mongo

# View MongoDB logs
docker logs mongodb

# Test connection
yarn commander:smart-app:run test-db-connection
```

#### Redis Connection Issues
```bash
# Check Redis status
docker ps | grep redis

# Test Redis connection
redis-cli ping

# View Redis logs
docker logs redis
```

#### Hedera Network Issues

```bash
# Test network connectivity
yarn commander:smart-app:run test-hedera-connection

# Check account balance
yarn commander:smart-app:run check-balance

# Validate credentials
yarn commander:smart-app:run validate-credentials

# Test token operations
yarn commander:smart-app:run test-token-creation

# Test topic operations
yarn commander:smart-app:run test-topic-creation

# Verify operator account setup
yarn commander:smart-app:run verify-operator
```

#### Transaction Issues

```bash
# Check transaction status
yarn commander:smart-app:run check-transaction --tx-id=0.0.123@1234567890.123456789

# Monitor transaction fees
yarn commander:smart-app:run monitor-fees

# Test smart node connectivity
yarn commander:smart-app:run test-smart-node-connection
```

#### Network Configuration Issues

```bash
# Verify network configuration
yarn commander:smart-app:run verify-network-config

# Test client connectivity
yarn commander:smart-app:run test-client-connection

# Check operator account permissions
yarn commander:smart-app:run check-permissions
```

### Debug Mode

Enable comprehensive debugging:

```bash
# Set debug environment
export IS_DEBUG_MODE=true
export DEBUG=smart-app:*

# Start with debug logging
yarn start:debug smart-app
```

### Log Analysis

```bash
# Filter application logs
docker logs smart-app | grep ERROR

# Monitor real-time logs
docker logs -f smart-app

# Export logs for analysis
docker logs smart-app > smart-app.log 2>&1
```

## 🤝 Contributing

We welcome contributions to the HSuite Smart App! Please follow our contribution guidelines:

### Development Workflow

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Make Changes**: Follow coding standards and add tests
4. **Run Tests**: `yarn test && yarn test:e2e`
5. **Update Documentation**: Include relevant documentation updates
6. **Commit Changes**: `git commit -m 'feat: add amazing feature'`
7. **Push Branch**: `git push origin feature/amazing-feature`
8. **Open Pull Request**: Provide detailed description of changes

### Coding Standards

- Follow TypeScript best practices
- Add comprehensive JSDoc comments for all public methods
- Include unit tests for new functionality
- Follow NestJS conventions and patterns
- Use meaningful variable and function names
- Keep functions small and focused

### Commit Message Format

```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(tokens): add token burning functionality

Implement token burn operation with proper validation
and error handling. Includes rate limiting and audit logging.

Closes #123
```

## 📄 License

This project is licensed under the PROPRIETARY License. See the [LICENSE](LICENSE) file for details.

**Copyright © 2024 HbarSuite Team. All rights reserved.**

## 🆘 Support

### Community Support

- 💬 **Discord**: [Join our Discord server](https://discord.gg/bHtu9AduNH)
- 📧 **Email**: support@hsuite.finance
- 📚 **Documentation**: [HSuite Docs](https://docs.hsuite.finance)
- 🐛 **Issues**: [GitHub Issues](https://github.com/HbarSuite/smart-engines/issues)

### Enterprise Support

For enterprise customers, we offer:
- Priority support with SLA guarantees
- Custom development and integration services
- Professional training and onboarding
- Dedicated support channels

Contact: enterprise@hsuite.finance

## 🙏 Acknowledgments

Special thanks to the amazing open-source community and the technologies that make this possible:

- **[NestJS](https://nestjs.com/)** - A progressive Node.js framework
- **[Hedera Hashgraph](https://hedera.com/)** - The enterprise-grade public network
- **[MongoDB](https://www.mongodb.com/)** - The database for modern applications
- **[Redis](https://redis.io/)** - The in-memory data structure store
- **[IPFS](https://ipfs.io/)** - A peer-to-peer hypermedia protocol

## 🗺️ Roadmap

### Upcoming Features

- **Q4 2024**
  - GraphQL API support
  - Enhanced monitoring dashboard
  - Advanced caching strategies
  - Multi-tenant architecture

- **Q1 2025**
  - Kubernetes deployment support
  - Advanced security features
  - Real-time analytics
  - Mobile SDK integration

- **Q2 2025**
  - Machine learning integration
  - Advanced smart contract tools
  - Enhanced developer experience
  - Performance optimizations

---

<div align="center">

**Built with ❤️ by the HSuite Team**

[Website](https://hsuite.finance) • [Documentation](https://docs.hsuite.finance) • [Discord](https://discord.gg/bHtu9AduNH) • [Twitter](https://twitter.com/hsuite_finance)

</div>