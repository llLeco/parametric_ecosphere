#!/usr/bin/env node

/**
 * @file generate-stakeholder-wallets.js
 * @description Generate stakeholder wallets for parametric insurance system
 * 
 * This script generates the 5 essential stakeholder wallets for the parametric insurance ecosystem:
 * 1. Oracle - Signs trigger events (weather data)
 * 2. SmartApp (Admin) - Manages policy registry and system operations
 * 3. Beneficiary (Farmer) - Receives payouts, pays premiums
 * 4. Contributor (Liquidity Provider) - Makes deposits to pool
 * 5. Reinsurer - Handles cession requests and provides additional funding
 */

const { Client, PrivateKey, AccountCreateTransaction, Hbar } = require('@hashgraph/sdk');
const fs = require('fs');
const path = require('path');

// SmartApp wallet credentials (provided by user)
const SMART_APP_ACCOUNT_ID = '0.0.5173509';
const SMART_APP_PRIVATE_KEY = '60062c82f2f6028f7af995ac4642b86e5e9c83f7e9a0b0afdc6bab95486d4b1c';

async function generateWallets() {
  console.log('🚀 Starting stakeholder wallet generation...');
  console.log(`Using SmartApp account: ${SMART_APP_ACCOUNT_ID}`);

  try {
    // Initialize Hedera client
    const client = Client.forTestnet();
    client.setOperator(SMART_APP_ACCOUNT_ID, SMART_APP_PRIVATE_KEY);

    const wallets = [];

    // Generate wallets for each stakeholder
    const stakeholders = [
      {
        role: 'Oracle',
        description: 'Signs trigger events (weather data) and publishes TriggerEvent with SmartNodes',
        permissions: ['trigger.sign', 'data.publish', 'consensus.participate'],
        initialBalance: 10
      },
      {
        role: 'Beneficiary (Farmer)',
        description: 'Receives PayoutExecuted in pool token and pays Premium to pool',
        permissions: ['payout.receive', 'premium.pay', 'policy.claim'],
        initialBalance: 10
      },
      {
        role: 'Contributor (Liquidity Provider)',
        description: 'Makes Deposit to pool and receives PoolToken (if modeled)',
        permissions: ['pool.deposit', 'liquidity.provide', 'token.receive'],
        initialBalance: 10
      },
      {
        role: 'Reinsurer',
        description: 'Handles CessionRequested and signs CessionFunded when providing extra funding',
        permissions: ['cession.handle', 'cession.fund', 'risk.transfer'],
        initialBalance: 10
      }
    ];

    for (const stakeholder of stakeholders) {
      console.log(`Creating wallet for ${stakeholder.role}...`);

      // Generate new key pair
      const newKey = PrivateKey.generateED25519();
      const publicKey = newKey.publicKey;

      // Create account transaction
      const accountCreateTransaction = new AccountCreateTransaction()
        .setKey(publicKey)
        .setInitialBalance(new Hbar(stakeholder.initialBalance))
        .setAccountMemo(`Stakeholder: ${stakeholder.role}`)
        .freezeWith(client);

      // Sign and execute transaction
      const signedTransaction = await accountCreateTransaction.sign(
        PrivateKey.fromStringED25519(SMART_APP_PRIVATE_KEY)
      );
      
      const txResponse = await signedTransaction.execute(client);
      const receipt = await txResponse.getReceipt(client);
      const accountId = receipt.accountId.toString();

      console.log(`✅ ${stakeholder.role} wallet created: ${accountId}`);

      wallets.push({
        role: stakeholder.role,
        description: stakeholder.description,
        accountId,
        privateKey: newKey.toString(),
        publicKey: publicKey.toString(),
        initialBalance: stakeholder.initialBalance.toString(),
        permissions: stakeholder.permissions
      });
    }

    // Add SmartApp wallet to the list
    const smartAppWallet = {
      role: 'SmartApp (Admin)',
      description: 'Manages policy registry, writes to registry/pool-events/payouts/policy-status, and requests cession. Operates the system.',
      accountId: SMART_APP_ACCOUNT_ID,
      privateKey: SMART_APP_PRIVATE_KEY,
      publicKey: derivePublicKey(SMART_APP_PRIVATE_KEY),
      initialBalance: '1000',
      permissions: ['admin.manage', 'policy.register', 'pool.manage', 'cession.request', 'system.operate']
    };
    wallets.push(smartAppWallet);

    // Save wallets to file
    const outputPath = './stakeholder-wallets.json';
    await saveWalletsToFile(wallets, outputPath);

    // Display summary
    displayWalletSummary(wallets);

    console.log('✅ Stakeholder wallet generation completed successfully!');
    console.log(`📄 Wallet information saved to: ${outputPath}`);

  } catch (error) {
    console.error('❌ Failed to generate stakeholder wallets:', error.message);
    process.exit(1);
  }
}

function derivePublicKey(privateKeyString) {
  try {
    const privateKey = PrivateKey.fromStringED25519(privateKeyString);
    return privateKey.publicKey.toString();
  } catch (error) {
    console.warn('Could not derive public key, using placeholder');
    return 'PUBLIC_KEY_DERIVATION_FAILED';
  }
}

async function saveWalletsToFile(wallets, outputPath) {
  try {
    const walletData = {
      generatedAt: new Date().toISOString(),
      network: 'Hedera Testnet',
      smartAppAccount: SMART_APP_ACCOUNT_ID,
      totalWallets: wallets.length,
      wallets: wallets.map(wallet => ({
        role: wallet.role,
        description: wallet.description,
        accountId: wallet.accountId,
        publicKey: wallet.publicKey,
        initialBalance: wallet.initialBalance,
        permissions: wallet.permissions,
        // Note: Private keys are included for development purposes only
        // In production, these should be stored securely and not in plain text
        privateKey: wallet.privateKey
      }))
    };

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write to file
    fs.writeFileSync(outputPath, JSON.stringify(walletData, null, 2));
    
    console.log(`💾 Wallet data saved to ${outputPath}`);

  } catch (error) {
    console.error('Failed to save wallets to file:', error.message);
    throw error;
  }
}

function displayWalletSummary(wallets) {
  console.log('\n📋 STAKEHOLDER WALLETS SUMMARY');
  console.log('=====================================');
  
  wallets.forEach((wallet, index) => {
    console.log(`\n${index + 1}. ${wallet.role}`);
    console.log(`   Account ID: ${wallet.accountId}`);
    console.log(`   Public Key: ${wallet.publicKey}`);
    console.log(`   Initial Balance: ${wallet.initialBalance} HBAR`);
    console.log(`   Description: ${wallet.description}`);
    console.log(`   Permissions: ${wallet.permissions.join(', ')}`);
  });

  console.log('\n🔐 SECURITY NOTES:');
  console.log('- Private keys are included for development purposes only');
  console.log('- Store private keys securely in production environments');
  console.log('- Consider using hardware wallets for production');
  console.log('- Never commit private keys to version control');
}

// Run the script
if (require.main === module) {
  generateWallets().catch(console.error);
}