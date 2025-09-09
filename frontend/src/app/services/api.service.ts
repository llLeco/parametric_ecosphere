import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { AxiosService } from './axios/axios.service';

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  parameters?: any;
  body?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.smartAppUrl;
  private axiosService: AxiosService;

  constructor() {
    // Configure AxiosService with the base URL
    AxiosService.configure(this.baseUrl);
    this.axiosService = AxiosService.getInstance(this.baseUrl);
  }

  // Policy Workflow Endpoints
  policyWorkflowEndpoints: ApiEndpoint[] = [
    {
      method: 'POST',
      path: '/policy-workflow/policies',
      description: 'Create a new parametric insurance policy',
      body: {
        beneficiaryAccountId: '0.0.123456',
        policyType: 'weather',
        coverageDetails: { maxPayout: 10000, currency: 'USD' }
      }
    },
    {
      method: 'PUT',
      path: '/policy-workflow/policies/:policyId/activate',
      description: 'Activate a policy',
      parameters: { policyId: 'POL123456' }
    },
    {
      method: 'POST',
      path: '/policy-workflow/triggers',
      description: 'Create a new trigger event',
      body: {
        policyId: 'POL123456',
        triggerType: 'temperature_threshold',
        thresholdValue: 35.0
      }
    },
    {
      method: 'POST',
      path: '/policy-workflow/solvency-test',
      description: 'Initiate solvency testing',
      body: {
        poolId: 'POOL001',
        testType: 'stress_test'
      }
    },
    {
      method: 'GET',
      path: '/policy-workflow/policies/:policyId/status',
      description: 'Get policy status',
      parameters: { policyId: 'POL123456' }
    },
    {
      method: 'GET',
      path: '/policy-workflow/policies/:policyId/triggers',
      description: 'Get policy triggers',
      parameters: { policyId: 'POL123456' }
    },
    {
      method: 'GET',
      path: '/policy-workflow/policies/:policyId/payouts',
      description: 'Get policy payouts',
      parameters: { policyId: 'POL123456' }
    },
    {
      method: 'GET',
      path: '/policy-workflow/analytics/dashboard',
      description: 'Get analytics dashboard'
    },
    {
      method: 'GET',
      path: '/policy-workflow/health/risk-pool',
      description: 'Get risk pool health'
    },
    {
      method: 'GET',
      path: '/policy-workflow/compliance/audit-trail',
      description: 'Get compliance audit trail'
    },
    {
      method: 'GET',
      path: '/policy-workflow/policies',
      description: 'Get list of policies',
      parameters: { status: 'active', limit: 10 }
    },
    {
      method: 'GET',
      path: '/policy-workflow/policies/:policyId/details',
      description: 'Get detailed policy information',
      parameters: { policyId: 'POL123456' }
    }
  ];

  // Automated Payout Endpoints
  automatedPayoutEndpoints: ApiEndpoint[] = [
    {
      method: 'POST',
      path: '/automated-payout/request',
      description: 'Request automated payout',
      body: {
        policyId: 'POL123456',
        payoutAmount: 50000,
        triggerId: 'TRG789',
        beneficiaryAccountId: '0.0.123456',
        poolId: 'POOL001'
      }
    },
    {
      method: 'GET',
      path: '/automated-payout/transactions/:transactionId/status',
      description: 'Get payout transaction status',
      parameters: { transactionId: 'TXN001' }
    },
    {
      method: 'POST',
      path: '/automated-payout/transactions/:transactionId/retry',
      description: 'Retry failed payout transaction',
      parameters: { transactionId: 'TXN001' }
    },
    {
      method: 'GET',
      path: '/automated-payout/transactions',
      description: 'Get list of payout transactions',
      parameters: { status: 'completed', limit: 10 }
    },
    {
      method: 'GET',
      path: '/automated-payout/liquidity-reservations',
      description: 'Get liquidity reservations',
      parameters: { poolId: 'POOL001' }
    },
    {
      method: 'GET',
      path: '/automated-payout/beneficiary-wallets/:accountId',
      description: 'Get beneficiary wallet information',
      parameters: { accountId: '0.0.123456' }
    },
    {
      method: 'POST',
      path: '/automated-payout/beneficiary-wallets/register',
      description: 'Register a new beneficiary wallet',
      body: {
        beneficiaryAccountId: '0.0.123456',
        walletAddress: '0.0.123456',
        walletType: 'hedera_native'
      }
    },
    {
      method: 'GET',
      path: '/automated-payout/analytics/dashboard',
      description: 'Get payout system analytics'
    },
    {
      method: 'GET',
      path: '/automated-payout/compliance/report',
      description: 'Get compliance report'
    }
  ];

  // Oracle Committee Endpoints
  oracleCommitteeEndpoints: ApiEndpoint[] = [
    {
      method: 'POST',
      path: '/oracle-committee/oracles/register',
      description: 'Register a new oracle node',
      body: {
        name: 'WeatherAPI Oracle',
        type: 'weather_oracle',
        endpoint: 'https://api.weather.com'
      }
    },
    {
      method: 'PUT',
      path: '/oracle-committee/oracles/:oracleId/approve',
      description: 'Approve an oracle',
      parameters: { oracleId: 'ORC001' }
    },
    {
      method: 'POST',
      path: '/oracle-committee/attestations/request',
      description: 'Request data attestation',
      body: {
        dataRequest: {
          parameter: 'temperature',
          location: { latitude: 40.7128, longitude: -74.0060 }
        }
      }
    },
    {
      method: 'POST',
      path: '/oracle-committee/attestations/:attestationId/signatures',
      description: 'Submit oracle signature',
      parameters: { attestationId: 'ATT001' },
      body: {
        oracleId: 'ORC001',
        signature: 'signature_data',
        dataValue: 35.2
      }
    },
    {
      method: 'POST',
      path: '/oracle-committee/data-sources/register',
      description: 'Register a new data source',
      body: {
        name: 'OpenWeatherMap API',
        type: 'weather_api',
        provider: 'OpenWeather Ltd.'
      }
    },
    {
      method: 'GET',
      path: '/oracle-committee/health/committee',
      description: 'Get committee health metrics'
    },
    {
      method: 'GET',
      path: '/oracle-committee/oracles',
      description: 'Get list of oracles',
      parameters: { status: 'active' }
    },
    {
      method: 'GET',
      path: '/oracle-committee/attestations',
      description: 'Get list of attestations',
      parameters: { status: 'consensus_reached' }
    },
    {
      method: 'GET',
      path: '/oracle-committee/attestations/:attestationId',
      description: 'Get attestation details',
      parameters: { attestationId: 'ATT001' }
    },
    {
      method: 'GET',
      path: '/oracle-committee/data-sources',
      description: 'Get list of data sources'
    },
    {
      method: 'GET',
      path: '/oracle-committee/analytics/performance',
      description: 'Get performance analytics'
    }
  ];

  // Reinsurance Endpoints
  reinsuranceEndpoints: ApiEndpoint[] = [
    {
      method: 'POST',
      path: '/reinsurance/contracts',
      description: 'Create a new reinsurance contract',
      body: {
        reinsurerName: 'Global Re Ltd',
        treatyType: 'quota_share',
        cessionPercentage: 25
      }
    },
    {
      method: 'POST',
      path: '/reinsurance/cessions/automated',
      description: 'Process automated cession',
      body: {
        policyId: 'POL123456',
        claimAmount: 500000,
        payoutId: 'PAY789012'
      }
    },
    {
      method: 'POST',
      path: '/reinsurance/recovery/submit',
      description: 'Submit recovery claim',
      body: {
        contractId: 'CON001',
        claimId: 'CLM123456',
        policyId: 'POL123456',
        claimAmount: 500000,
        recoveryType: 'claim_recovery'
      }
    },
    {
      method: 'GET',
      path: '/reinsurance/analytics/cessions',
      description: 'Get cession analytics'
    },
    {
      method: 'GET',
      path: '/reinsurance/contracts',
      description: 'Get list of contracts',
      parameters: { status: 'active' }
    },
    {
      method: 'GET',
      path: '/reinsurance/contracts/:contractId',
      description: 'Get contract details',
      parameters: { contractId: 'CON001' }
    },
    {
      method: 'GET',
      path: '/reinsurance/cessions',
      description: 'Get list of cessions',
      parameters: { contractId: 'CON001' }
    },
    {
      method: 'GET',
      path: '/reinsurance/recovery-claims',
      description: 'Get recovery claims',
      parameters: { contractId: 'CON001' }
    },
    {
      method: 'GET',
      path: '/reinsurance/dashboard/analytics',
      description: 'Get dashboard analytics'
    },
    {
      method: 'GET',
      path: '/reinsurance/compliance/report',
      description: 'Get compliance report'
    }
  ];

  // Risk Pool Endpoints
  riskPoolEndpoints: ApiEndpoint[] = [
    {
      method: 'POST',
      path: '/risk-pool/pools',
      description: 'Create a new risk pool',
      body: {
        name: 'Weather Risk Pool',
        type: 'weather',
        targetCapacity: 1000000
      }
    },
    {
      method: 'POST',
      path: '/risk-pool/pools/:poolId/contributions/premium',
      description: 'Process premium contribution',
      parameters: { poolId: 'POOL001' },
      body: {
        contributorAccountId: '0.0.123456',
        amount: 5000,
        policyId: 'POL123456'
      }
    },
    {
      method: 'GET',
      path: '/risk-pool/pools/:poolId/liquidity/check',
      description: 'Check liquidity sufficiency',
      parameters: { poolId: 'POOL001', amount: 100000 }
    },
    {
      method: 'POST',
      path: '/risk-pool/pools/:poolId/liquidity/reserve',
      description: 'Reserve liquidity',
      parameters: { poolId: 'POOL001' },
      body: {
        amount: 100000,
        claimId: 'CLM123456'
      }
    },
    {
      method: 'POST',
      path: '/risk-pool/pools/:poolId/liquidity/release',
      description: 'Release reserved liquidity',
      parameters: { poolId: 'POOL001' },
      body: {
        amount: 100000,
        claimId: 'CLM123456',
        wasUsed: true
      }
    },
    {
      method: 'POST',
      path: '/risk-pool/pools/:poolId/stress-test',
      description: 'Perform stress testing',
      parameters: { poolId: 'POOL001' }
    },
    {
      method: 'GET',
      path: '/risk-pool/pools/:poolId/analytics',
      description: 'Get pool analytics',
      parameters: { poolId: 'POOL001' }
    },
    {
      method: 'GET',
      path: '/risk-pool/pools',
      description: 'Get list of risk pools',
      parameters: { status: 'active' }
    },
    {
      method: 'GET',
      path: '/risk-pool/pools/:poolId/contributions',
      description: 'Get contribution history',
      parameters: { poolId: 'POOL001' }
    },
    {
      method: 'GET',
      path: '/risk-pool/pools/:poolId/liquidity-positions',
      description: 'Get liquidity positions',
      parameters: { poolId: 'POOL001' }
    },
    {
      method: 'GET',
      path: '/risk-pool/analytics/dashboard',
      description: 'Get dashboard analytics'
    },
    {
      method: 'GET',
      path: '/risk-pool/pools/:poolId/solvency-report',
      description: 'Get solvency report',
      parameters: { poolId: 'POOL001' }
    }
  ];

  // Solvency Audit Endpoints
  solvencyAuditEndpoints: ApiEndpoint[] = [
    {
      method: 'POST',
      path: '/solvency-audit/solvency-test',
      description: 'Initiate solvency test',
      body: {
        poolId: 'POOL001',
        testType: 'stress_test'
      }
    },
    {
      method: 'GET',
      path: '/solvency-audit/audit-trail',
      description: 'Get audit trail'
    },
    {
      method: 'GET',
      path: '/solvency-audit/compliance-dashboard',
      description: 'Get compliance dashboard'
    },
    {
      method: 'GET',
      path: '/solvency-audit/regulatory-reports',
      description: 'Get regulatory reports'
    },
    {
      method: 'GET',
      path: '/solvency-audit/immutable-records',
      description: 'Get immutable records'
    }
  ];

  // Hedera Service Endpoints
  hederaEndpoints: ApiEndpoint[] = [
    // Accounts
    {
      method: 'POST',
      path: '/accounts/create',
      description: 'Create a new Hedera account',
      body: { initialBalance: 10 }
    },
    {
      method: 'POST',
      path: '/accounts/transfer',
      description: 'Transfer HBAR between accounts',
      body: {
        fromAccountId: '0.0.123456',
        toAccountId: '0.0.789012',
        amount: 100
      }
    },
    {
      method: 'GET',
      path: '/accounts/:accountId/info',
      description: 'Get account information',
      parameters: { accountId: '0.0.123456' }
    },
    {
      method: 'GET',
      path: '/accounts/:accountId/balance',
      description: 'Get account balance',
      parameters: { accountId: '0.0.123456' }
    },
    // Tokens
    {
      method: 'POST',
      path: '/tokens/create/fungible',
      description: 'Create a fungible token',
      body: {
        name: 'Example Token',
        symbol: 'EXT',
        decimals: 2,
        initialSupply: 1000,
        treasuryAccountId: '0.0.12345'
      }
    },
    {
      method: 'POST',
      path: '/tokens/mint',
      description: 'Mint additional tokens',
      body: {
        tokenId: '0.0.12345',
        amount: 500
      }
    },
    {
      method: 'GET',
      path: '/tokens/:tokenId/info',
      description: 'Get token information',
      parameters: { tokenId: '0.0.12345' }
    },
    // Topics
    {
      method: 'POST',
      path: '/topics/create',
      description: 'Create a new topic',
      body: {
        memo: 'My Application Messages',
        validatorConsensusTimestamp: '2024-01-01T00:00:00.000Z'
      }
    },
    {
      method: 'POST',
      path: '/topics/submit/:topicId',
      description: 'Submit message to topic',
      parameters: { topicId: '0.0.12345' },
      body: {
        message: 'Hello Hedera!',
        sequenceNumber: 1
      }
    },
    {
      method: 'GET',
      path: '/topics/messages/:topicId',
      description: 'Get topic messages',
      parameters: { topicId: '0.0.12345' }
    },
    {
      method: 'GET',
      path: '/topics/:topicId/info',
      description: 'Get topic information',
      parameters: { topicId: '0.0.12345' }
    }
  ];

  // Get all endpoints grouped by module
  getAllEndpoints() {
    return {
      'Policy Workflow': this.policyWorkflowEndpoints,
      'Automated Payout': this.automatedPayoutEndpoints,
      'Oracle Committee': this.oracleCommitteeEndpoints,
      'Reinsurance': this.reinsuranceEndpoints,
      'Risk Pool': this.riskPoolEndpoints,
      'Solvency Audit': this.solvencyAuditEndpoints,
      'Hedera Services': this.hederaEndpoints
    };
  }

  // Get current wallet ID from localStorage or session
  private getCurrentWalletId(): string | null {
    // Try to get wallet ID from various sources
    const walletId = localStorage.getItem('wallet_id') ||
                    localStorage.getItem('current_wallet') ||
                    sessionStorage.getItem('wallet_id');

    if (!walletId) {
      console.warn('No wallet ID found. API calls will be made without wallet authentication.');
    }

    return walletId;
  }

  // Set wallet ID for API calls
  setWalletId(walletId: string): void {
    if (walletId) {
      localStorage.setItem('wallet_id', walletId);
      console.log(`Wallet ID set for API calls: ${walletId}`);
    }
  }

  // Get current wallet status
  getWalletStatus(): { isConnected: boolean; walletId: string | null } {
    const walletId = this.getCurrentWalletId();
    return {
      isConnected: !!walletId,
      walletId: walletId
    };
  }

  // Generic method to call any endpoint
  callEndpoint(endpoint: ApiEndpoint): Observable<any> {
    const url = this.replacePathParameters(endpoint.path, endpoint.parameters);
    const walletId = this.getCurrentWalletId();

    // If no wallet ID, make public request
    if (!walletId) {
      return this.callPublicEndpoint(endpoint, url);
    }

    // Make authenticated request with wallet ID
    return this.callAuthenticatedEndpoint(endpoint, url, walletId);
  }

  // Call endpoint without wallet authentication
  private callPublicEndpoint(endpoint: ApiEndpoint, url: string): Observable<any> {
    const promise = AxiosService.getPublic(url);
    return from(promise.then(response => response.data));
  }

  // Call endpoint with wallet authentication
  private callAuthenticatedEndpoint(endpoint: ApiEndpoint, url: string, walletId: string): Observable<any> {
    let promise: Promise<any>;

    switch (endpoint.method) {
      case 'GET':
        promise = AxiosService.get(walletId, url).then(response => response.data);
        break;
      case 'POST':
        promise = AxiosService.post(walletId, url, endpoint.body || {}).then(response => response.data);
        break;
      case 'PUT':
        promise = AxiosService.put(walletId, url, endpoint.body || {}).then(response => response.data);
        break;
      case 'DELETE':
        promise = AxiosService.delete(walletId, url).then(response => response.data);
        break;
      case 'PATCH':
        promise = AxiosService.patch(walletId, url, endpoint.body || {}).then(response => response.data);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${endpoint.method}`);
    }

    return from(promise);
  }

  private replacePathParameters(path: string, parameters?: any): string {
    if (!parameters) return path;

    let newPath = path;
    Object.keys(parameters).forEach(key => {
      newPath = newPath.replace(`:${key}`, parameters[key]);
    });
    return newPath;
  }
}
