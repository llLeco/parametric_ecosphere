import { Controller, Get, Post, Put, Body, Param, Query, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { OracleCommitteeService } from './oracle-committee.service';
import { Oracle } from './schemas/oracle.schema';
import { DataAttestation } from './schemas/data-attestation.schema';
import { DataSource } from './schemas/data-source.schema';

@ApiTags('Oracle Committee')
@Controller('oracle-committee')
export class OracleCommitteeController {
  private readonly logger = new Logger(OracleCommitteeController.name);

  constructor(private readonly oracleCommitteeService: OracleCommitteeService) {}

  @Post('oracles/register')
  @ApiOperation({ summary: 'Register a new oracle node in the committee' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Oracle registered successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid oracle data' })
  async registerOracle(@Body() oracleData: Partial<Oracle>) {
    this.logger.log(`Registering oracle: ${oracleData.name}`);
    return await this.oracleCommitteeService.registerOracle(oracleData);
  }

  @Put('oracles/:oracleId/approve')
  @ApiOperation({ summary: 'Approve an oracle for active participation' })
  @ApiParam({ name: 'oracleId', description: 'Oracle ID to approve' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Oracle approved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Oracle not found' })
  async approveOracle(@Param('oracleId') oracleId: string) {
    this.logger.log(`Approving oracle: ${oracleId}`);
    return await this.oracleCommitteeService.approveOracle(oracleId);
  }

  @Post('attestations/request')
  @ApiOperation({ summary: 'Request data attestation from oracle committee' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Attestation request created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid attestation request' })
  async requestDataAttestation(@Body() attestationRequest: Partial<DataAttestation>) {
    this.logger.log(`Requesting data attestation for ${attestationRequest.dataRequest?.parameter}`);
    return await this.oracleCommitteeService.requestDataAttestation(attestationRequest);
  }

  @Post('attestations/:attestationId/signatures')
  @ApiOperation({ summary: 'Submit oracle signature for data attestation' })
  @ApiParam({ name: 'attestationId', description: 'Attestation ID to submit signature for' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Oracle signature submitted successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid signature data' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Attestation not found' })
  async submitOracleSignature(
    @Param('attestationId') attestationId: string,
    @Body() signatureData: {
      oracleId: string;
      signature: string;
      dataValue: number;
    }
  ) {
    this.logger.log(`Processing oracle signature from ${signatureData.oracleId}`);
    return await this.oracleCommitteeService.submitOracleSignature(
      attestationId,
      signatureData.oracleId,
      signatureData.signature,
      signatureData.dataValue
    );
  }

  @Post('data-sources/register')
  @ApiOperation({ summary: 'Register a new data source' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Data source registered successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid data source configuration' })
  async registerDataSource(@Body() dataSourceData: Partial<DataSource>) {
    this.logger.log(`Registering data source: ${dataSourceData.name}`);
    return await this.oracleCommitteeService.registerDataSource(dataSourceData);
  }

  @Get('health/committee')
  @ApiOperation({ summary: 'Get oracle committee health metrics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Committee health metrics retrieved successfully' })
  async getCommitteeHealth() {
    this.logger.log('Retrieving committee health metrics');
    return await this.oracleCommitteeService.getCommitteeHealthMetrics();
  }

  @Get('oracles')
  @ApiOperation({ summary: 'Get list of registered oracles' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by oracle status' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by oracle type' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Oracle list retrieved successfully' })
  async getOracles(
    @Query('status') status?: string,
    @Query('type') type?: string
  ) {
    // Mock response - implementation would query actual oracles
    return {
      oracles: [
        {
          oracleId: 'ORC001',
          name: 'WeatherAPI Oracle',
          type: 'weather_oracle',
          status: 'active',
          reputationScore: 0.95,
          totalAttestations: 1250,
          accuracyRate: 0.97
        },
        {
          oracleId: 'ORC002',
          name: 'Satellite Data Oracle',
          type: 'satellite_oracle',
          status: 'active',
          reputationScore: 0.92,
          totalAttestations: 890,
          accuracyRate: 0.94
        }
      ],
      totalCount: 2,
      filters: { status, type }
    };
  }

  @Get('attestations')
  @ApiOperation({ summary: 'Get list of data attestations' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by attestation status' })
  @ApiQuery({ name: 'dataType', required: false, description: 'Filter by data type' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results to return' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Attestation list retrieved successfully' })
  async getAttestations(
    @Query('status') status?: string,
    @Query('dataType') dataType?: string,
    @Query('limit') limit?: number
  ) {
    // Mock response - implementation would query actual attestations
    return {
      attestations: [
        {
          attestationId: 'ATT001',
          dataType: 'temperature',
          status: 'consensus_reached',
          finalValue: 35.2,
          confidence: 0.95,
          participatingOracles: 4,
          requestTimestamp: new Date(),
          consensusTimestamp: new Date()
        },
        {
          attestationId: 'ATT002',
          dataType: 'rainfall',
          status: 'pending',
          participatingOracles: 2,
          requiredOracles: 3,
          requestTimestamp: new Date()
        }
      ],
      totalCount: 2,
      filters: { status, dataType, limit }
    };
  }

  @Get('attestations/:attestationId')
  @ApiOperation({ summary: 'Get detailed information about a specific attestation' })
  @ApiParam({ name: 'attestationId', description: 'Attestation ID to retrieve' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Attestation details retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Attestation not found' })
  async getAttestationDetails(@Param('attestationId') attestationId: string) {
    // Mock detailed attestation response
    return {
      attestationId,
      dataRequest: {
        parameter: 'temperature',
        location: { latitude: 40.7128, longitude: -74.0060, name: 'New York' },
        timeWindow: { start: new Date(), end: new Date() },
        requiredAccuracy: 0.95
      },
      status: 'consensus_reached',
      oracleSignatures: [
        {
          oracleId: 'ORC001',
          value: 35.1,
          timestamp: new Date(),
          weight: 1.2
        },
        {
          oracleId: 'ORC002',
          value: 35.3,
          timestamp: new Date(),
          weight: 1.1
        },
        {
          oracleId: 'ORC003',
          value: 35.2,
          timestamp: new Date(),
          weight: 1.0
        }
      ],
      consensusResult: {
        finalValue: 35.2,
        confidence: 0.95,
        standardDeviation: 0.1,
        outliers: []
      },
      validationChecks: {
        sourceValidation: true,
        rangeValidation: true,
        temporalValidation: true,
        crossValidation: true,
        anomalyDetection: true
      }
    };
  }

  @Get('data-sources')
  @ApiOperation({ summary: 'Get list of registered data sources' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by data source type' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by data source status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Data source list retrieved successfully' })
  async getDataSources(
    @Query('type') type?: string,
    @Query('status') status?: string
  ) {
    // Mock data sources response
    return {
      dataSources: [
        {
          dataSourceId: 'SRC001',
          name: 'OpenWeatherMap API',
          provider: 'OpenWeather Ltd.',
          type: 'weather_api',
          status: 'active',
          dataTypes: ['temperature', 'humidity', 'pressure', 'wind_speed'],
          geographicCoverage: { global: true },
          qualityScore: 0.95,
          updateFrequency: 'hourly'
        },
        {
          dataSourceId: 'SRC002',
          name: 'NASA Earth Data',
          provider: 'NASA',
          type: 'satellite_feed',
          status: 'active',
          dataTypes: ['temperature', 'precipitation', 'vegetation_index'],
          geographicCoverage: { global: true },
          qualityScore: 0.98,
          updateFrequency: 'daily'
        }
      ],
      totalCount: 2,
      filters: { type, status }
    };
  }

  @Get('analytics/performance')
  @ApiOperation({ summary: 'Get oracle committee performance analytics' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period for analytics (7d, 30d, 90d)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Performance analytics retrieved successfully' })
  async getPerformanceAnalytics(@Query('period') period: string = '30d') {
    // Mock performance analytics
    return {
      period,
      metrics: {
        totalAttestations: 245,
        successfulAttestations: 234,
        successRate: 0.955,
        averageResponseTime: 12.5, // minutes
        averageConfidence: 0.92,
        oracleParticipation: {
          activeOracles: 8,
          averageParticipationRate: 0.85
        },
        dataTypes: {
          temperature: { count: 89, successRate: 0.97 },
          rainfall: { count: 67, successRate: 0.94 },
          wind_speed: { count: 45, successRate: 0.96 },
          humidity: { count: 44, successRate: 0.93 }
        }
      },
      trends: {
        weeklySuccessRates: [0.94, 0.95, 0.97, 0.96],
        weeklyResponseTimes: [14.2, 13.1, 11.8, 12.5]
      },
      timestamp: new Date()
    };
  }
}
