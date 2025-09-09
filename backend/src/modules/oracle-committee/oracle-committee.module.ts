import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OracleCommitteeService } from './oracle-committee.service';
import { OracleCommitteeController } from './oracle-committee.controller';
import { Oracle, OracleSchema } from './schemas/oracle.schema';
import { DataAttestation, DataAttestationSchema } from './schemas/data-attestation.schema';
import { DataSource, DataSourceSchema } from './schemas/data-source.schema';

/**
 * @class OracleCommitteeModule
 * @description Sensor/Oracle Committee module for external data validation and attestation
 * 
 * This module manages:
 * - Oracle node registration and reputation tracking
 * - Data source integration (weather APIs, IoT sensors, satellite data)
 * - Multi-signature attestation process for trigger events
 * - Data validation and consensus mechanisms
 * - Integration with Hedera Consensus Service (HCS) for immutable records
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Oracle.name, schema: OracleSchema },
      { name: DataAttestation.name, schema: DataAttestationSchema },
      { name: DataSource.name, schema: DataSourceSchema }
    ])
  ],
  controllers: [OracleCommitteeController],
  providers: [OracleCommitteeService],
  exports: [OracleCommitteeService]
})
export class OracleCommitteeModule {}
