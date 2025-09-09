import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Oracle, OracleDocument, OracleStatus } from './schemas/oracle.schema';
import { DataAttestation, DataAttestationDocument, AttestationStatus } from './schemas/data-attestation.schema';
import { DataSource, DataSourceDocument, DataSourceStatus } from './schemas/data-source.schema';

@Injectable()
export class OracleCommitteeService {
  private readonly logger = new Logger(OracleCommitteeService.name);

  constructor(
    @InjectModel(Oracle.name) private oracleModel: Model<OracleDocument>,
    @InjectModel(DataAttestation.name) private attestationModel: Model<DataAttestationDocument>,
    @InjectModel(DataSource.name) private dataSourceModel: Model<DataSourceDocument>,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * Register a new oracle node in the committee
   */
  async registerOracle(oracleData: Partial<Oracle>): Promise<OracleDocument> {
    this.logger.log(`Registering new oracle: ${oracleData.name}`);
    
    const oracle = new this.oracleModel({
      ...oracleData,
      oracleId: this.generateOracleId(),
      status: OracleStatus.PENDING_APPROVAL,
      registrationDate: new Date(),
      reputationMetrics: {
        totalAttestations: 0,
        accurateAttestations: 0,
        accuracyRate: 0,
        responseTime: 0,
        uptime: 100,
        stakingAmount: oracleData.economicTerms?.stakingRequirement || 0,
        slashingHistory: []
      }
    });

    const savedOracle = await oracle.save();
    
    this.eventEmitter.emit('oracle.registered', { oracleId: savedOracle.oracleId, oracle: savedOracle });
    
    return savedOracle;
  }

  /**
   * Approve an oracle for active participation
   */
  async approveOracle(oracleId: string): Promise<OracleDocument> {
    this.logger.log(`Approving oracle: ${oracleId}`);
    
    const oracle = await this.oracleModel.findOneAndUpdate(
      { oracleId },
      { status: OracleStatus.ACTIVE, lastActiveDate: new Date() },
      { new: true }
    );

    if (!oracle) {
      throw new Error(`Oracle ${oracleId} not found`);
    }

    this.eventEmitter.emit('oracle.approved', { oracleId, oracle });
    
    return oracle;
  }

  /**
   * Request data attestation from oracle committee
   */
  async requestDataAttestation(attestationRequest: Partial<DataAttestation>): Promise<DataAttestationDocument> {
    this.logger.log(`Requesting data attestation for ${attestationRequest.dataRequest?.parameter}`);
    
    const attestation = new this.attestationModel({
      ...attestationRequest,
      attestationId: this.generateAttestationId(),
      requestTimestamp: new Date(),
      status: AttestationStatus.PENDING,
      expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    });

    const savedAttestation = await attestation.save();
    
    // Find qualified oracles for this data request
    const qualifiedOracles = await this.findQualifiedOracles(attestationRequest.dataRequest);
    
    // Emit event to notify oracles of new attestation request
    this.eventEmitter.emit('attestation.requested', {
      attestationId: savedAttestation.attestationId,
      qualifiedOracles: qualifiedOracles.map(o => o.oracleId),
      dataRequest: attestationRequest.dataRequest
    });
    
    return savedAttestation;
  }

  /**
   * Submit oracle signature for data attestation
   */
  async submitOracleSignature(
    attestationId: string,
    oracleId: string,
    signature: string,
    dataValue: number
  ): Promise<DataAttestationDocument> {
    this.logger.log(`Processing oracle signature from ${oracleId} for attestation ${attestationId}`);
    
    const oracle = await this.oracleModel.findOne({ oracleId, status: OracleStatus.ACTIVE });
    if (!oracle) {
      throw new Error(`Oracle ${oracleId} not found or not active`);
    }

    const attestation = await this.attestationModel.findOne({ attestationId });
    if (!attestation) {
      throw new Error(`Attestation ${attestationId} not found`);
    }

    // Verify signature (simplified - in reality would verify cryptographic signature)
    const isValidSignature = this.verifyOracleSignature(signature, oracle.publicKey, dataValue);
    if (!isValidSignature) {
      throw new Error('Invalid oracle signature');
    }

    // Add oracle signature to attestation
    const oracleSignature = {
      oracleId,
      signature,
      timestamp: new Date(),
      publicKey: oracle.publicKey,
      weight: this.calculateOracleWeight(oracle)
    };

    const updatedAttestation = await this.attestationModel.findOneAndUpdate(
      { attestationId },
      { 
        $push: { oracleSignatures: oracleSignature },
        $set: { [`aggregatedData.rawValues`]: [...(attestation.aggregatedData?.rawValues || []), dataValue] }
      },
      { new: true }
    );

    // Check if consensus is reached
    await this.checkConsensus(updatedAttestation);
    
    // Update oracle reputation
    await this.updateOracleReputation(oracleId, 'signature_submitted');
    
    return updatedAttestation;
  }

  /**
   * Check if consensus is reached for an attestation
   */
  async checkConsensus(attestation: DataAttestationDocument): Promise<void> {
    this.logger.log(`Checking consensus for attestation: ${attestation.attestationId}`);
    
    const requiredSignatures = 3; // Minimum required signatures
    const consensusThreshold = 0.66; // 66% agreement required
    
    if (attestation.oracleSignatures.length < requiredSignatures) {
      return; // Not enough signatures yet
    }

    const rawValues = attestation.aggregatedData?.rawValues || [];
    const { consensusValue, confidence, outliers } = this.calculateConsensus(rawValues, attestation.oracleSignatures);
    
    const totalWeight = attestation.oracleSignatures.reduce((sum, sig) => sum + sig.weight, 0);
    const consensusWeight = attestation.oracleSignatures
      .filter(sig => !outliers.includes(sig.oracleId))
      .reduce((sum, sig) => sum + sig.weight, 0);
    
    const consensusReached = (consensusWeight / totalWeight) >= consensusThreshold;
    
    const consensusResult = {
      requiredSignatures,
      receivedSignatures: attestation.oracleSignatures.length,
      consensusThreshold,
      consensusReached,
      finalValue: consensusValue,
      confidence,
      outliers
    };

    const aggregatedData = {
      rawValues,
      mean: this.calculateMean(rawValues),
      median: this.calculateMedian(rawValues),
      standardDeviation: this.calculateStandardDeviation(rawValues),
      outlierThreshold: 2.0, // 2 standard deviations
      finalValue: consensusValue,
      unit: 'metric_unit' // Should be derived from data request
    };

    await this.attestationModel.findOneAndUpdate(
      { attestationId: attestation.attestationId },
      {
        status: consensusReached ? AttestationStatus.CONSENSUS_REACHED : AttestationStatus.DISPUTED,
        consensusResult,
        aggregatedData
      }
    );

    if (consensusReached) {
      this.logger.log(`Consensus reached for attestation: ${attestation.attestationId}`);
      
      // Emit event for successful consensus
      this.eventEmitter.emit('attestation.consensus_reached', {
        attestationId: attestation.attestationId,
        finalValue: consensusValue,
        confidence
      });
      
      // Update oracle reputations based on accuracy
      await this.updateOracleReputationsPostConsensus(attestation, consensusValue, outliers);
    } else {
      this.logger.warn(`Consensus not reached for attestation: ${attestation.attestationId}`);
      
      this.eventEmitter.emit('attestation.disputed', {
        attestationId: attestation.attestationId,
        outliers
      });
    }
  }

  /**
   * Register a new data source
   */
  async registerDataSource(dataSourceData: Partial<DataSource>): Promise<DataSourceDocument> {
    this.logger.log(`Registering new data source: ${dataSourceData.name}`);
    
    const dataSource = new this.dataSourceModel({
      ...dataSourceData,
      dataSourceId: this.generateDataSourceId(),
      status: DataSourceStatus.ACTIVE,
      registrationDate: new Date()
    });

    const savedDataSource = await dataSource.save();
    
    this.eventEmitter.emit('data_source.registered', { 
      dataSourceId: savedDataSource.dataSourceId, 
      dataSource: savedDataSource 
    });
    
    return savedDataSource;
  }

  /**
   * Get oracle committee health metrics
   */
  async getCommitteeHealthMetrics(): Promise<any> {
    this.logger.log('Calculating oracle committee health metrics');
    
    const totalOracles = await this.oracleModel.countDocuments();
    const activeOracles = await this.oracleModel.countDocuments({ status: OracleStatus.ACTIVE });
    const recentAttestations = await this.attestationModel.countDocuments({
      requestTimestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    const consensusSuccessRate = await this.calculateConsensusSuccessRate();
    const averageResponseTime = await this.calculateAverageResponseTime();
    
    return {
      totalOracles,
      activeOracles,
      oracleUtilization: activeOracles / totalOracles,
      recentAttestations,
      consensusSuccessRate,
      averageResponseTime,
      healthScore: this.calculateHealthScore(activeOracles, consensusSuccessRate, averageResponseTime),
      timestamp: new Date()
    };
  }

  // Helper methods
  private generateOracleId(): string {
    return `ORC${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }

  private generateAttestationId(): string {
    return `ATT${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }

  private generateDataSourceId(): string {
    return `SRC${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }

  private async findQualifiedOracles(dataRequest: any): Promise<OracleDocument[]> {
    // Find oracles that can provide the requested data type and location
    return await this.oracleModel.find({
      status: OracleStatus.ACTIVE,
      supportedDataTypes: dataRequest.parameter,
      'geographicCoverage.coordinates': {
        $elemMatch: {
          $and: [
            { latitude: { $gte: dataRequest.location.latitude - 1, $lte: dataRequest.location.latitude + 1 } },
            { longitude: { $gte: dataRequest.location.longitude - 1, $lte: dataRequest.location.longitude + 1 } }
          ]
        }
      }
    });
  }

  private verifyOracleSignature(signature: string, publicKey: string, dataValue: number): boolean {
    // Simplified signature verification - in reality would use proper cryptographic verification
    return signature && signature.length > 10 && publicKey && !isNaN(dataValue);
  }

  private calculateOracleWeight(oracle: OracleDocument): number {
    // Weight based on reputation metrics
    const baseWeight = 1.0;
    const accuracyBonus = oracle.reputationMetrics.accuracyRate * 0.5;
    const uptimeBonus = oracle.reputationMetrics.uptime * 0.3;
    const stakingBonus = Math.min(oracle.reputationMetrics.stakingAmount / 100000, 0.2);
    
    return baseWeight + accuracyBonus + uptimeBonus + stakingBonus;
  }

  private calculateConsensus(values: number[], signatures: any[]): any {
    const mean = this.calculateMean(values);
    const stdDev = this.calculateStandardDeviation(values);
    const outlierThreshold = 2.0;
    
    const outliers = [];
    const validValues = [];
    
    values.forEach((value, index) => {
      const zScore = Math.abs((value - mean) / stdDev);
      if (zScore > outlierThreshold) {
        outliers.push(signatures[index].oracleId);
      } else {
        validValues.push(value);
      }
    });
    
    const consensusValue = this.calculateMean(validValues);
    const confidence = Math.max(0, 1 - (stdDev / mean));
    
    return { consensusValue, confidence, outliers };
  }

  private calculateMean(values: number[]): number {
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = this.calculateMean(values);
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = this.calculateMean(squaredDiffs);
    return Math.sqrt(avgSquaredDiff);
  }

  private async updateOracleReputation(oracleId: string, action: string): Promise<void> {
    const oracle = await this.oracleModel.findOne({ oracleId });
    if (!oracle) return;

    oracle.reputationMetrics.totalAttestations += 1;
    oracle.lastActiveDate = new Date();

    await oracle.save();
  }

  private async updateOracleReputationsPostConsensus(
    attestation: DataAttestationDocument, 
    consensusValue: number, 
    outliers: string[]
  ): Promise<void> {
    for (const signature of attestation.oracleSignatures) {
      const oracle = await this.oracleModel.findOne({ oracleId: signature.oracleId });
      if (!oracle) continue;

      if (!outliers.includes(signature.oracleId)) {
        oracle.reputationMetrics.accurateAttestations += 1;
      }

      oracle.reputationMetrics.accuracyRate = 
        oracle.reputationMetrics.accurateAttestations / oracle.reputationMetrics.totalAttestations;

      await oracle.save();
    }
  }

  private async calculateConsensusSuccessRate(): Promise<number> {
    const totalAttestations = await this.attestationModel.countDocuments();
    const successfulAttestations = await this.attestationModel.countDocuments({
      status: AttestationStatus.CONSENSUS_REACHED
    });
    
    return totalAttestations > 0 ? successfulAttestations / totalAttestations : 0;
  }

  private async calculateAverageResponseTime(): Promise<number> {
    // Mock calculation - in reality would calculate based on actual response times
    return 15; // minutes
  }

  private calculateHealthScore(activeOracles: number, consensusRate: number, responseTime: number): number {
    const oracleScore = Math.min(activeOracles / 10, 1.0) * 0.4; // 40% weight
    const consensusScore = consensusRate * 0.4; // 40% weight
    const responseScore = Math.max(0, 1 - (responseTime / 60)) * 0.2; // 20% weight
    
    return oracleScore + consensusScore + responseScore;
  }
}
