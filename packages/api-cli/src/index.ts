#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Keypair } from '@solana/web3.js';
import { RpcConnection, PubkeyUtil, RuntimeTransaction } from '@repo/arch-sdk';
import { 
  initializeMintTx, 
  mintToTx, 
  transferTx, 
  SignerCallback,
  toArchPubkey,
  APL_TOKEN_PROGRAM_ID
} from '@repo/apl-token';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const program = new Command();

// Create a signer callback that uses the keypair's secret key
const createSignerFromKeypair = (keypairData: { secretKey: string }): SignerCallback => {
  return async (transaction: RuntimeTransaction): Promise<RuntimeTransaction> => {
    // In a real implementation, we would:
    // 1. Convert hex secret key back to Uint8Array
    // 2. Create a Keypair from the secret key
    // 3. Sign the transaction with the keypair
    // 4. Return the signed transaction
    const secretKey = Buffer.from(keypairData.secretKey, 'hex');
    const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
    
    // For now, just return the transaction as is (stub)
    return transaction;
  };
};

program
  .name('api-cli')
  .description('CLI for wallet and token operations on Arch network')
  .version('0.0.1');

// Command: create-keypair
program
  .command('create-keypair')
  .description('Creates a local private keypair and saves to file')
  .option('-o, --output <path>', 'output file path', './keypair.json')
  .action((options) => {
    const keypair = Keypair.generate();
    const filePath = path.resolve(options.output);
    fs.writeFileSync(filePath, JSON.stringify({
      publicKey: Buffer.from(keypair.publicKey.toBytes()).toString('hex'),
      secretKey: Buffer.from(keypair.secretKey).toString('hex')
    }, null, 2));
    console.log(`Keypair saved to ${filePath}`);
  });

// Wallet commands
program
  .command('wallet')
  .description('Wallet operations')
  .command('balance')
  .description('Get wallet balance on Arch network')
  .requiredOption('-k, --keypair <path>', 'keypair file path')
  .requiredOption('-r, --rpc <url>', 'RPC endpoint URL', 'http://localhost:8899')
  .action(async (options) => {
    try {
      const keypairPath = path.resolve(options.keypair);
      const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
      const walletKeypair = Keypair.fromSecretKey(
        Buffer.from(keypairData.secretKey, 'hex')
      );
      const walletPubkey = toArchPubkey(walletKeypair.publicKey);

      // Initialize RPC connection
      const rpcConnection = new RpcConnection(options.rpc);
      
      console.log('Fetching wallet balance...');
      console.log(`Public Key: ${keypairData.publicKey}`);
      console.log(`RPC URL: ${options.rpc}`);
      
      // Stub: In real implementation, we would:
      // 1. Use rpcConnection to fetch account info
      // 2. Parse account data to get balance
      // 3. Display formatted balance
      console.log('Balance: Stub - Will implement actual balance check');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('An unknown error occurred');
      }
      process.exit(1);
    }
  });

// Token commands
const token = program
  .command('token')
  .description('Token operations');

token
  .command('send')
  .description('Send tokens to another address')
  .requiredOption('-k, --keypair <path>', 'sender keypair file path')
  .requiredOption('-t, --to <address>', 'recipient address')
  .requiredOption('-a, --amount <number>', 'amount to send')
  .action(async (options) => {
    try {
      const keypairPath = path.resolve(options.keypair);
      const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
      const senderKeypair = Keypair.fromSecretKey(
        Buffer.from(keypairData.secretKey, 'hex')
      );
      const senderPubkey = toArchPubkey(senderKeypair.publicKey);
      const recipientPubkey = Buffer.from(options.to, 'hex');
      const amount = BigInt(options.amount);

      console.log('Creating transfer transaction...');
      console.log(`From: ${keypairData.publicKey}`);
      console.log(`To: ${options.to}`);
      console.log(`Amount: ${options.amount}`);

      // Create and send transfer transaction (stubbed)
      const signer = createSignerFromKeypair(keypairData);
      const tx = await transferTx(
        senderPubkey,
        recipientPubkey,
        amount,
        senderPubkey,
        signer
      );
      console.log('Transaction created (stub)');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('An unknown error occurred');
      }
      process.exit(1);
    }
  });

token
  .command('mint')
  .description('Mint new tokens')
  .requiredOption('-k, --keypair <path>', 'minter keypair file path')
  .requiredOption('-m, --mint <address>', 'mint address')
  .requiredOption('-t, --to <address>', 'recipient address')
  .requiredOption('-a, --amount <number>', 'amount to mint')
  .action(async (options) => {
    try {
      const keypairPath = path.resolve(options.keypair);
      const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
      const minterKeypair = Keypair.fromSecretKey(
        Buffer.from(keypairData.secretKey, 'hex')
      );
      const minterPubkey = toArchPubkey(minterKeypair.publicKey);
      const mintPubkey = Buffer.from(options.mint, 'hex');
      const recipientPubkey = Buffer.from(options.to, 'hex');
      const amount = BigInt(options.amount);

      console.log('Creating mint transaction...');
      console.log(`Minter: ${keypairData.publicKey}`);
      console.log(`Mint address: ${options.mint}`);
      console.log(`To address: ${options.to}`);
      console.log(`Amount: ${options.amount}`);

      // Create and send mint transaction (stubbed)
      const signer = createSignerFromKeypair(keypairData);
      const tx = await mintToTx(
        mintPubkey,
        recipientPubkey,
        amount,
        minterPubkey,
        signer
      );
      console.log('Transaction created (stub)');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('An unknown error occurred');
      }
      process.exit(1);
    }
  });

program.parseAsync(process.argv);
