import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  BadRequestException, 
  Query
} from '@nestjs/common';
import { TopicsService } from './topics.service';
import { Hashgraph, IHashgraph } from '@hsuite/hashgraph-types';
import { LoggerHelper } from '@hsuite/helpers';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBody, 
  ApiParam, 
  ApiOkResponse, 
  ApiBadRequestResponse, 
  ApiNotFoundResponse,
  ApiQuery
} from '@nestjs/swagger';

/**
 * Controller responsible for handling Hedera Consensus Service (HCS) topic operations.
 * 
 * This controller provides endpoints for demonstrating HCS functionality including:
 * - Creating and managing topics
 * - Submitting messages to topics
 * - Retrieving topic information and messages
 * 
 * These endpoints serve as examples of how to integrate HCS with your applications
 * and demonstrate best practices for topic management.
 *
 * @class TopicsController
 * @description Handles all HCS topic-related HTTP endpoints
 */
@ApiTags('Hedera Consensus Service')
@Controller('topics')
export class TopicsController {
  private readonly logger = new LoggerHelper(TopicsController.name);

  /**
   * Creates an instance of TopicsController.
   * 
   * @param {TopicsService} topicsService - The service handling HCS topic operations
   * @constructor
   */
  constructor(private readonly topicsService: TopicsService) {}
  
  /**
   * Creates a new topic on the Hedera network.
   * 
   * This endpoint allows for the creation of a new HCS topic with optional
   * configuration. The topic is created using the operator account credentials
   * configured in the application.
   * 
   * @param {IHashgraph.ILedger.IHCS.ITopic.ICreate} params - Request body containing topic creation parameters
   * @returns {Promise<string>} A promise resolving to the new topic ID
   * @throws {BadRequestException} If topic creation fails
   * 
   * @example
   * // Create topic with custom memo
   * POST /topics/create
   * Body: { 
   *   "memo": "My Application Messages",
   *   "validatorConsensusTimestamp": "2024-01-01T00:00:00.000Z"
   * }
   */
  @ApiOperation({
    summary: 'Create a new HCS topic',
    description: 'Creates a new topic on the Hedera network with optional configuration'
  })
  @ApiBody({
    type: Object,
    required: true,
    description: 'Topic creation parameters including optional memo and timestamp'
  })
  @ApiOkResponse({
    type: String,
    description: 'The newly created topic ID in the format 0.0.12345'
  })
  @ApiBadRequestResponse({
    description: 'Invalid topic creation parameters or network error'
  })
  @Post('create')
  async createTopic(
    @Body() params: IHashgraph.ILedger.IHCS.ITopic.ICreate
  ): Promise<string> {
    try {
      return await this.topicsService.createTopic(params);
    } catch (error) {
      this.logger.error(`Failed to create topic: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }
  
  /**
   * Submits a message to an existing topic.
   * 
   * This endpoint facilitates the submission of messages to HCS topics.
   * The message is submitted using the operator account as the sender.
   * 
   * @param {IHashgraph.ILedger.IHCS.ITopic.IMessage.ISubmit} params - Message submission parameters
   * @returns {Promise<string>} A promise resolving to the transaction ID
   * @throws {BadRequestException} If message submission fails
   * 
   * @example
   * // Submit a message to topic 0.0.12345
   * POST /topics/submit
   * Body: { 
   *   "topicId": "0.0.12345",
   *   "message": "Hello Hedera!"
   * }
   */
  @ApiOperation({
    summary: 'Submit message to topic',
    description: 'Submits a message to an existing HCS topic'
  })
  @ApiBody({
    type: Hashgraph.Ledger.HCS.Topic.Message.Submit,
    required: true,
    description: 'Message submission details including topic ID and message content'
  })
  @ApiParam({
    name: 'topicId',
    type: String,
    required: true,
    description: 'The HCS topic ID in the format 0.0.12345'
  })
  @ApiOkResponse({
    type: String,
    description: 'Transaction ID of the completed message submission'
  })
  @ApiBadRequestResponse({
    description: 'Invalid message parameters or network error'
  })
  @Post('submit/:topicId')
  async submitMessage(
    @Param('topicId') topicId: string,
    @Body() params: IHashgraph.ILedger.IHCS.ITopic.IMessage.ISubmit
  ): Promise<string> {
    try {
      return await this.topicsService.submitMessage(topicId, params);
    } catch (error) {
      this.logger.error(`Failed to submit message: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }
  
  /**
   * Retrieves messages from a specific topic.
   * 
   * This endpoint queries the Hedera network for messages from a topic,
   * including their content, sequence numbers, and timestamps.
   * 
   * @param {string} topic - The HCS topic ID in the format 0.0.12345
   * @param {string} encoding - Message encoding format
   * @param {number} limit - Maximum number of messages
   * @param {string} order - Sort order (asc/desc)
   * @param {number} sequenceNumber - Starting sequence number
   * @param {string} timestamp - Starting timestamp
   * @returns {Promise<Hashgraph.Restful.HCS.Message.Entity[]>} A promise resolving to the topic messages
   * @throws {BadRequestException} If message retrieval fails
   * 
   * @example
   * // Get messages from topic 0.0.12345
   * POST /topics/messages
   * Body: {
   *   "topicId": "0.0.12345",
   *   "start": 0,
   *   "end": 10,
   *   "callbackSuccess": (msg) => console.log(msg),
   *   "callbackError": (msg, err) => console.error(err)
   * }
   */
  @ApiOperation({
    summary: 'Get topic messages',
    description: 'Retrieves messages from a specific HCS topic'
  })
  @ApiParam({
    name: 'topicId',
    type: String,
    required: true,
    description: 'The HCS topic ID in the format 0.0.12345'
  })
  @ApiQuery({
    name: 'encoding',
    type: String,
    required: false,
    description: 'Message encoding format (e.g., utf-8, base64)'
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Maximum number of messages to retrieve'
  })
  @ApiQuery({
    name: 'order',
    type: String,
    required: false,
    description: 'Sort order for messages (asc/desc)'
  })
  @ApiQuery({
    name: 'sequenceNumber',
    type: Number,
    required: false,
    description: 'Starting sequence number for message retrieval'
  })
  @ApiQuery({
    name: 'timestamp',
    type: String,
    required: false,
    description: 'Starting timestamp for message retrieval'
  })
  @ApiOkResponse({
    type: Array,
    description: 'Array of messages with their content and metadata'
  })
  @ApiNotFoundResponse({
    description: 'Topic not found on the Hedera network'
  })
  @ApiBadRequestResponse({
    description: 'Invalid topic ID or network error'
  })
  @Get('messages/:topicId')
  async getTopicMessages(
    @Param('topicId') topicId: string,
    @Query('encoding') encoding?: string,
    @Query('limit') limit?: number,
    @Query('order') order?: string,
    @Query('sequenceNumber') sequenceNumber?: number,
    @Query('timestamp') timestamp?: string
  ): Promise<Hashgraph.Restful.HCS.Message.Entity[]> {
    try {
      return await this.topicsService.getTopicMessages(
        topicId,
        encoding,
        limit,
        order,
        sequenceNumber,
        timestamp
      );
    } catch (error) {
      this.logger.error(`Failed to get topic messages: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }
  
  /**
   * Retrieves detailed information about a specific topic.
   * 
   * This endpoint queries the Hedera network for comprehensive information about
   * a topic, including its configuration, state, and associated resources.
   * 
   * @param {string} topicId - The HCS topic ID to query
   * @returns {Promise<IHashgraph.ILedger.IHCS.ITopic.IInfo>} A promise resolving to detailed topic information
   * @throws {BadRequestException} If topic information retrieval fails
   * 
   * @example
   * // Get detailed information for topic 0.0.12345
   * GET /topics/0.0.12345/info
   */
  @ApiOperation({
    summary: 'Get topic information',
    description: 'Retrieves detailed information about a specific HCS topic'
  })
  @ApiParam({
    name: 'topicId',
    type: String,
    required: true,
    description: 'The HCS topic ID in the format 0.0.12345'
  })
  @ApiOkResponse({
    type: Object,
    description: 'Detailed topic information including configuration and state'
  })
  @ApiNotFoundResponse({
    description: 'Topic not found on the Hedera network'
  })
  @ApiBadRequestResponse({
    description: 'Invalid topic ID or network error'
  })
  @Get(':topicId/info')
  async getTopicInfo(
    @Param('topicId') topicId: string
  ): Promise<IHashgraph.ILedger.IHCS.ITopic.IInfo> {
    try {
      return await this.topicsService.getTopicInfo(topicId);
    } catch (error) {
      this.logger.error(`Failed to get topic info: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }
} 