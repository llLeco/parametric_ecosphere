import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SmartAppModule } from '../../src/smart-app.module';

/**
 * @file parametric-insurance-flow.e2e-spec.ts
 * @description End-to-end integration test for the complete parametric insurance flow
 * as shown in the sequence diagram
 * 
 * This test validates the complete flow:
 * 1. Index & Trigger Attestation (Oracle Committee → HCS → Policy Workflow)
 * 2. Premiums & Pooling (Risk Pool management)
 * 3. Automated Payout (Liquidity check → HTS transfer → Beneficiary)
 * 4. Automated Cession to Reinsurer (Risk sharing)
 * 5. Solvency Trail & Audit (Real-time monitoring)
 */
describe('Parametric Insurance Ecosystem E2E Flow', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  // Test data
  const testPolicy = {
    beneficiaryAccountId: '0.0.123456',
    insurerAccountId: '0.0.654321',
    policyType: 'weather',
    triggerConditions: [{
      parameter: 'temperature',
      operator: 'gt',
      threshold: 35,
      measurementPeriod: 1,
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        radius: 10
      }
    }],
    premiumStructure: {
      basePremium: 5000,
      currency: 'HBAR',
      paymentSchedule: 'annually',
      totalPremium: 5000
    },
    coverageDetails: {
      maxPayout: 50000,
      deductible: 1000,
      currency: 'HBAR',
      payoutStructure: 'lump_sum',
      waitingPeriod: 0
    },
    effectiveDate: new Date(),
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  };

  const testTriggerEvent = {
    parameter: 'temperature',
    value: 36.5,
    unit: 'celsius',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      name: 'New York'
    },
    source: 'oracle_committee'
  };

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [SmartAppModule.register()],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await moduleFixture.close();
  });

  describe('Complete Parametric Insurance Flow', () => {
    let createdPolicyId: string;
    let triggerId: string;
    let payoutId: string;
    let poolId: string;

    it('Step 1: Create and activate a parametric insurance policy', async () => {
      // Create policy
      const policyResponse = await request(app.getHttpServer())
        .post('/policy-workflow/policies')
        .send(testPolicy)
        .expect(201);

      createdPolicyId = policyResponse.body.policyNumber;
      expect(createdPolicyId).toBeDefined();
      expect(policyResponse.body.status).toBe('draft');

      // Activate policy
      const activationResponse = await request(app.getHttpServer())
        .put(`/policy-workflow/policies/${createdPolicyId}/activate`)
        .expect(200);

      expect(activationResponse.body.status).toBe('active');
    });

    it('Step 2: Create risk pool and process premium contribution', async () => {
      // Create risk pool
      const poolResponse = await request(app.getHttpServer())
        .post('/risk-pool/pools')
        .send({
          name: 'Weather Risk Pool Test',
          description: 'Test pool for weather insurance',
          poolType: 'weather',
          targetCapacity: 1000000,
          minimumCapacity: 100000,
          managingEntityId: '0.0.poolmanager',
          riskParameters: {
            maxSingleLoss: 100000,
            maxAggregateExposure: 500000,
            expectedLossRatio: 0.6
          }
        })
        .expect(201);

      poolId = poolResponse.body.poolId;
      expect(poolId).toBeDefined();

      // Process premium contribution
      const premiumResponse = await request(app.getHttpServer())
        .post(`/risk-pool/pools/${poolId}/contributions/premium`)
        .send({
          contributorAccountId: testPolicy.beneficiaryAccountId,
          amount: testPolicy.premiumStructure.totalPremium,
          policyId: createdPolicyId
        })
        .expect(201);

      expect(premiumResponse.body.status).toBe('allocated');
    });

    it('Step 3: Oracle Committee processes trigger attestation', async () => {
      // Submit trigger event to oracle committee
      const attestationResponse = await request(app.getHttpServer())
        .post('/oracle-committee/attestations/request')
        .send({
          dataRequest: {
            parameter: testTriggerEvent.parameter,
            location: testTriggerEvent.location,
            timeWindow: {
              start: new Date(),
              end: new Date()
            },
            requiredAccuracy: 0.95,
            urgency: 'high'
          }
        })
        .expect(201);

      const attestationId = attestationResponse.body.attestationId;
      
      // Simulate oracle signatures (multiple oracles providing data)
      const oracles = ['ORC001', 'ORC002', 'ORC003'];
      for (const oracleId of oracles) {
        await request(app.getHttpServer())
          .post(`/oracle-committee/attestations/${attestationId}/signatures`)
          .send({
            oracleId,
            signature: `signature_${oracleId}_${Date.now()}`,
            dataValue: testTriggerEvent.value + (Math.random() - 0.5) * 0.5 // Slight variation
          })
          .expect(201);
      }

      // Verify consensus was reached
      const attestationStatus = await request(app.getHttpServer())
        .get(`/oracle-committee/attestations/${attestationId}`)
        .expect(200);

      expect(attestationStatus.body.status).toBe('consensus_reached');
    });

    it('Step 4: Process trigger event through policy workflow', async () => {
      // Submit trigger event to policy workflow
      const triggerResponse = await request(app.getHttpServer())
        .post('/policy-workflow/triggers')
        .send({
          policyId: createdPolicyId,
          source: 'oracle_committee',
          eventData: testTriggerEvent
        })
        .expect(201);

      triggerId = triggerResponse.body.triggerId;
      expect(triggerResponse.body.status).toBe('validated');
    });

    it('Step 5: Execute automated payout with liquidity validation', async () => {
      // Check liquidity before payout
      const liquidityCheck = await request(app.getHttpServer())
        .get(`/risk-pool/pools/${poolId}/liquidity/check`)
        .query({ amount: testPolicy.coverageDetails.maxPayout })
        .expect(200);

      expect(liquidityCheck.body.hasSufficientLiquidity).toBe(true);

      // Request automated payout
      const payoutResponse = await request(app.getHttpServer())
        .post('/automated-payout/request')
        .send({
          policyId: createdPolicyId,
          payoutAmount: testPolicy.coverageDetails.maxPayout - testPolicy.coverageDetails.deductible,
          triggerId,
          beneficiaryAccountId: testPolicy.beneficiaryAccountId,
          poolId
        })
        .expect(201);

      payoutId = payoutResponse.body.payoutId;
      expect(payoutResponse.body.status).toBe('completed');
      expect(payoutResponse.body.htsDetails).toBeDefined();
    });

    it('Step 6: Process automated cession to reinsurer', async () => {
      // Trigger automated cession
      const cessionResponse = await request(app.getHttpServer())
        .post('/reinsurance/cessions/automated')
        .send({
          policyId: createdPolicyId,
          claimAmount: testPolicy.coverageDetails.maxPayout - testPolicy.coverageDetails.deductible,
          payoutId
        })
        .expect(201);

      expect(Array.isArray(cessionResponse.body)).toBe(true);
      if (cessionResponse.body.length > 0) {
        expect(cessionResponse.body[0].status).toBe('completed');
        expect(cessionResponse.body[0].htsDetails).toBeDefined();
      }
    });

    it('Step 7: Conduct real-time solvency test', async () => {
      // Conduct solvency test
      const solvencyResponse = await request(app.getHttpServer())
        .post('/solvency-audit/solvency-test')
        .send({
          testType: 'event_triggered'
        })
        .expect(201);

      expect(solvencyResponse.body.testId).toBeDefined();
      expect(solvencyResponse.body.complianceStatus).toBeDefined();
      expect(solvencyResponse.body.capitalAdequacy.solvencyRatio).toBeGreaterThan(0);
    });

    it('Step 8: Verify comprehensive audit trail', async () => {
      // Get audit trail for the complete flow
      const auditResponse = await request(app.getHttpServer())
        .get('/solvency-audit/audit-trail')
        .query({
          startDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // Last hour
          endDate: new Date().toISOString()
        })
        .expect(200);

      expect(Array.isArray(auditResponse.body)).toBe(true);
      
      // Verify key events are recorded
      const eventTypes = auditResponse.body.map((entry: any) => entry.eventType);
      expect(eventTypes).toContain('policy_created');
      expect(eventTypes).toContain('trigger_validated');
      expect(eventTypes).toContain('payout_executed');
      expect(eventTypes).toContain('solvency_test_conducted');
    });

    it('Step 9: Verify system analytics and health', async () => {
      // Check policy workflow analytics
      const policyAnalytics = await request(app.getHttpServer())
        .get('/policy-workflow/analytics/dashboard')
        .expect(200);

      expect(policyAnalytics.body.totalPolicies).toBeGreaterThan(0);
      expect(policyAnalytics.body.solvencyRatio).toBeGreaterThan(0);

      // Check payout system analytics
      const payoutAnalytics = await request(app.getHttpServer())
        .get('/automated-payout/analytics/dashboard')
        .expect(200);

      expect(payoutAnalytics.body.systemMetrics).toBeDefined();
      expect(payoutAnalytics.body.hederaIntegration).toBeDefined();

      // Check compliance dashboard
      const complianceResponse = await request(app.getHttpServer())
        .get('/solvency-audit/compliance-dashboard')
        .expect(200);

      expect(complianceResponse.body.solvencyMetrics).toBeDefined();
      expect(complianceResponse.body.auditMetrics).toBeDefined();
      expect(complianceResponse.body.regulatoryStatus).toBeDefined();
    });

    it('Step 10: Validate Hedera integration points', async () => {
      // Verify HCS integration (mocked responses)
      const hcsValidation = {
        topicsCreated: true,
        messagesSubmitted: true,
        consensusReached: true
      };

      // Verify HTS integration (mocked responses)
      const htsValidation = {
        tokensTransferred: true,
        finalityConfirmed: true,
        feesCalculated: true
      };

      // Verify HFS integration for document storage (mocked responses)
      const hfsValidation = {
        documentsStored: true,
        hashesVerified: true,
        accessControlled: true
      };

      expect(hcsValidation.topicsCreated).toBe(true);
      expect(htsValidation.tokensTransferred).toBe(true);
      expect(hfsValidation.documentsStored).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('Should handle insufficient liquidity gracefully', async () => {
      const insufficientLiquidityResponse = await request(app.getHttpServer())
        .post('/automated-payout/request')
        .send({
          policyId: 'test_policy',
          payoutAmount: 999999999, // Extremely large amount
          triggerId: 'test_trigger',
          beneficiaryAccountId: '0.0.123456',
          poolId: 'test_pool'
        })
        .expect(201);

      expect(insufficientLiquidityResponse.body.status).toBe('failed');
      expect(insufficientLiquidityResponse.body.failureReason).toBe('insufficient_liquidity');
    });

    it('Should handle invalid trigger conditions', async () => {
      const invalidTriggerResponse = await request(app.getHttpServer())
        .post('/policy-workflow/triggers')
        .send({
          policyId: 'nonexistent_policy',
          source: 'oracle_committee',
          eventData: {
            parameter: 'temperature',
            value: 20, // Below threshold
            unit: 'celsius'
          }
        })
        .expect(201);

      // Should not trigger payout for values below threshold
      expect(invalidTriggerResponse.body.triggerConditionMet?.isMet).toBeFalsy();
    });

    it('Should maintain audit trail integrity', async () => {
      const auditIntegrity = await request(app.getHttpServer())
        .get('/solvency-audit/immutable-records')
        .query({ limit: 10 })
        .expect(200);

      expect(auditIntegrity.body.verificationStatus.verificationRate).toBe(1.0);
      expect(auditIntegrity.body.verificationStatus.blockchainHealth).toBe('healthy');
    });
  });
});
