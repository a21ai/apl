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
  createAssociatedTokenAccountTx,
  SignerCallback,
  toArchPubkey,
  APL_TOKEN_PROGRAM_ID
} from '@repo/apl-token';
import { Pubkey } from '@repo/arch-sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const program = new Command();

/**
 * Ensures an associated token account exists for the given wallet and mint
 * @param wallet The wallet to create the associated account for
 * @param mint The mint address of the token
 * @param payer The account that will pay for the creation
 * @param signer Callback to sign the transaction
 * @returns Promise<RuntimeTransaction> The create account transaction, if needed
 */
async function ensureAssociatedAccountExists(
  wallet: Pubkey,
  mint: Pubkey,
  payer: Pubkey,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  // For now, always create the associated token account
  // In a future implementation, we could check if it exists first
  return createAssociatedTokenAccountTx(
    wallet,
    mint,
    payer,
    signer
  );
}

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
  .name('apl-cli')
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
  .command('deploy')
  .description('Deploy a new token')
  .requiredOption('-k, --keypair <path>', 'authority keypair file path')
  .option('-d, --decimals <number>', 'number of decimals for the token', '9')
  .option('-f, --freeze-authority <address>', 'optional freeze authority address')
  .action(async (options) => {
    try {
      const keypairPath = path.resolve(options.keypair);
      const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
      const authorityKeypair = Keypair.fromSecretKey(
        Buffer.from(keypairData.secretKey, 'hex')
      );
      const authorityPubkey = toArchPubkey(authorityKeypair.publicKey);
      
      // Generate a new mint keypair
      const mintKeypair = Keypair.generate();
      const mintPubkey = toArchPubkey(mintKeypair.publicKey);
      
      // Parse freeze authority if provided
      const freezeAuthority = options.freezeAuthority 
        ? Buffer.from(options.freezeAuthority, 'hex')
        : null;
      
      const decimals = parseInt(options.decimals, 10);
      if (isNaN(decimals) || decimals < 0 || decimals > 255) {
        throw new Error('Decimals must be a number between 0 and 255');
      }

      console.log('Deploying new token...');
      console.log(`Authority: ${keypairData.publicKey}`);
      console.log(`Mint Address: ${Buffer.from(mintPubkey).toString('hex')}`);
      console.log(`Decimals: ${decimals}`);
      if (freezeAuthority) {
        console.log(`Freeze Authority: ${options.freezeAuthority}`);
      }

      // Create and send initialize mint transaction
      const signer = createSignerFromKeypair(keypairData);
      const tx = await initializeMintTx(
        mintPubkey,
        decimals,
        authorityPubkey,
        freezeAuthority,
        authorityPubkey,
        signer
      );
      
      // Create associated token account for the authority
      const assocTx = await createAssociatedTokenAccountTx(
        authorityPubkey,
        mintPubkey,
        authorityPubkey,
        signer
      );

      console.log('Token deployed successfully');
      console.log('Transactions created (stub)');
      console.log('Note: Save the mint address for future operations!');
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
  .description('Mint tokens to a recipient (requires mint authority)')
  .requiredOption('-k, --keypair <path>', 'mint authority keypair file path')
  .requiredOption('-m, --mint <address>', 'mint address')
  .requiredOption('-t, --to <address>', 'recipient address')
  .requiredOption('-a, --amount <number>', 'amount to mint')
  .action(async (options) => {
    try {
      const keypairPath = path.resolve(options.keypair);
      const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
      const authorityKeypair = Keypair.fromSecretKey(
        Buffer.from(keypairData.secretKey, 'hex')
      );
      const authorityPubkey = toArchPubkey(authorityKeypair.publicKey);
      const mintPubkey = Buffer.from(options.mint, 'hex');
      const recipientPubkey = Buffer.from(options.to, 'hex');
      const amount = BigInt(options.amount);

      console.log('Creating mint transaction...');
      console.log(`Authority: ${keypairData.publicKey}`);
      console.log(`Mint address: ${options.mint}`);
      console.log(`To address: ${options.to}`);
      console.log(`Amount: ${options.amount}`);

      // Create signer callback
      const signer = createSignerFromKeypair(keypairData);

      // Ensure recipient has an associated token account
      console.log('Creating associated token account if needed...');
      const assocTx = await createAssociatedTokenAccountTx(
        recipientPubkey,
        mintPubkey,
        authorityPubkey,
        signer
      );

      // Create mint transaction
      console.log('Creating mint transaction...');
      const mintTx = await mintToTx(
        mintPubkey,
        recipientPubkey,
        amount,
        authorityPubkey,
        signer
      );

      console.log('Transactions created (stub)');
      console.log('Note: Transaction will fail if signer is not the mint authority');
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
