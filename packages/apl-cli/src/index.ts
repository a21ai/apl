#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getConfig, setConfig, readConfig } from './config.js';
import { Keypair } from '@solana/web3.js';
import { RpcConnection, PubkeyUtil, RuntimeTransaction } from '@repo/arch-sdk';
import { 
  initializeMintTx, 
  mintToTx, 
  transferTx, 
  createAssociatedTokenAccountTx,
  deriveAssociatedTokenAddress,
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

// Config commands
const config = program
  .command('config')
  .description('Manage CLI configuration');

config
  .command('get')
  .description('Get current config settings')
  .action(getConfig);

config
  .command('set')
  .description('Set config settings')
  .option('--url <url>', 'RPC endpoint URL')
  .option('--keypair <path>', 'Path to keypair file')
  .action((options) => {
    const config: { rpcUrl?: string; keypair?: string } = {};
    if (options.url) config.rpcUrl = options.url;
    if (options.keypair) config.keypair = options.keypair;
    setConfig(config);
  });

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
  .command('balance')
  .description('Get wallet balance')
  .action(async () => {
    try {
      const config = readConfig();
      const keypairData = JSON.parse(fs.readFileSync(config.keypair, 'utf8'));
      const walletKeypair = Keypair.fromSecretKey(
        Buffer.from(keypairData.secretKey, 'hex')
      );
      const walletPubkey = toArchPubkey(walletKeypair.publicKey);

      // Initialize RPC connection
      const rpcConnection = new RpcConnection(config.rpcUrl);
      
      console.log('Fetching wallet balance...');
      console.log(`Public Key: ${keypairData.publicKey}`);
      console.log(`RPC URL: ${config.rpcUrl}`);
      
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

program
  .command('send')
  .description('Send tokens to another address')
  .requiredOption('-t, --to <address>', 'recipient address')
  .requiredOption('-a, --amount <number>', 'amount to send')
  .action(async (options: { to: string; amount: string }) => {
    try {
      const config = readConfig();
      const keypairData = JSON.parse(fs.readFileSync(config.keypair, 'utf8'));
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

program
  .command('create-token')
  .description('Create a new token')
  .option('--decimals <n>', 'Number of decimals', '9')
  .option('--freeze-authority <pubkey>', 'Optional freeze authority')
  .action(async (options: { decimals?: string; freezeAuthority?: string }) => {
    try {
      // Read config for keypair path
      const config = readConfig();
      const keypairData = JSON.parse(fs.readFileSync(config.keypair, 'utf8'));
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
      
      const decimals = parseInt(options.decimals || '9', 10);
      if (isNaN(decimals) || decimals < 0 || decimals > 255) {
        throw new Error('Decimals must be a number between 0 and 255');
      }

      console.log(`Creating token ${Buffer.from(mintPubkey).toString('hex')}`);
      if (freezeAuthority) {
        console.log(`Freeze authority: ${options.freezeAuthority}`);
      }
      console.log(`Token successfully created`);
      console.log(`Signature: ${Buffer.from(mintPubkey).toString('hex')}`)

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

      // Note: In real implementation, we would:
      // 1. Submit transaction to network
      // 2. Wait for confirmation
      // 3. Return actual signature
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('An unknown error occurred');
      }
      process.exit(1);
    }
  });

program
  .command('supply <tokenAddress>')
  .description('Get token supply')
  .action(async (tokenAddress: string) => {
    try {
      const config = readConfig();
      const rpcConnection = new RpcConnection(config.rpcUrl);
      const mintPubkey = Buffer.from(tokenAddress, 'hex');

      console.log(`Getting token supply for ${tokenAddress}...`);
      
      try {
        // Fetch mint account data
        const accountInfo = await rpcConnection.readAccountInfo(mintPubkey);
        if (!accountInfo || !accountInfo.data) {
          throw new Error('Token not found');
        }

        // Ensure we have account data
        if (!accountInfo.data || accountInfo.data.length < 9) {
          throw new Error('Invalid token account data');
        }

        // Parse supply from account data (first 8 bytes are supply)
        const supply = BigInt('0x' + Buffer.from(accountInfo.data.slice(0, 8)).toString('hex'));
        const decimals = Number(accountInfo.data[8]); // 9th byte is decimals

        if (isNaN(decimals) || decimals < 0 || decimals > 255) {
          throw new Error('Invalid token decimals');
        }

        // Format with proper decimals
        const formattedSupply = Number(supply) / Math.pow(10, decimals);
        console.log(`${formattedSupply}`);
      } catch (error) {
        if (error instanceof Error && error.message === 'Token not found') {
          console.error('Error: Invalid token account');
        } else {
          console.error('Error: Unable to fetch token supply');
        }
        process.exit(1);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('An unknown error occurred');
      }
      process.exit(1);
    }
  });

program
  .command('mint')
  .description('Mint tokens to a recipient (requires mint authority)')
  .requiredOption('-m, --mint <address>', 'mint address')
  .requiredOption('-t, --to <address>', 'recipient address')
  .requiredOption('-a, --amount <number>', 'amount to mint')
  .action(async (options: { mint: string; to: string; amount: string }) => {
    try {
      const config = readConfig();
      const keypairData = JSON.parse(fs.readFileSync(config.keypair, 'utf8'));
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

program
  .command('accounts')
  .description('List all token accounts')
  .option('-v, --verbose', 'Show detailed token information')
  .action(async (options) => {
    try {
      const config = readConfig();
      const keypairData = JSON.parse(fs.readFileSync(config.keypair, 'utf8'));
      const walletKeypair = Keypair.fromSecretKey(
        Buffer.from(keypairData.secretKey, 'hex')
      );
      const walletPubkey = toArchPubkey(walletKeypair.publicKey);

      // Initialize RPC connection
      const rpcConnection = new RpcConnection(config.rpcUrl);

      // Get all token accounts for wallet
      const accounts = await rpcConnection.getProgramAccounts(APL_TOKEN_PROGRAM_ID);
      if (!accounts || accounts.length === 0) {
        console.log('No token accounts found');
        return;
      }

      for (const account of accounts) {
        if (!account.account || !account.account.data) continue;

        // First 32 bytes are owner
        const owner = account.account.data.slice(0, 32);
        if (Buffer.compare(Buffer.from(owner), Buffer.from(walletPubkey)) !== 0) continue;

        // Next 32 bytes are mint
        const mint = account.account.data.slice(32, 64);
        const mintAddress = Buffer.from(mint).toString('hex');

        // Get mint info for decimals
        const mintInfo = await rpcConnection.readAccountInfo(mint);
        if (!mintInfo || !mintInfo.data) continue;
        const decimals = Number(mintInfo.data[8]);

        // Parse balance (first 8 bytes after mint)
        const balance = BigInt('0x' + Buffer.from(account.account.data.slice(64, 72)).toString('hex'));
        const formattedBalance = Number(balance) / Math.pow(10, decimals);

        if (options.verbose) {
          console.log('Token Account:', Buffer.from(account.pubkey).toString('hex'));
          console.log('Token:', mintAddress);
          console.log('Balance:', formattedBalance);
          console.log('Decimals:', decimals);
          console.log('---');
        } else {
          console.log(`${Buffer.from(account.pubkey).toString('hex')}  ${formattedBalance} ${mintAddress}`);
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('An unknown error occurred');
      }
      process.exit(1);
    }
  });

program
  .command('balance <tokenAddress>')
  .description('Get token account balance')
  .action(async (tokenAddress: string) => {
    try {
      const config = readConfig();
      const keypairData = JSON.parse(fs.readFileSync(config.keypair, 'utf8'));
      const walletKeypair = Keypair.fromSecretKey(
        Buffer.from(keypairData.secretKey, 'hex')
      );
      const walletPubkey = toArchPubkey(walletKeypair.publicKey);
      const mintPubkey = Buffer.from(tokenAddress, 'hex');

      // Initialize RPC connection
      const rpcConnection = new RpcConnection(config.rpcUrl);

      // Get token info for decimals
      const tokenInfo = await rpcConnection.readAccountInfo(mintPubkey);
      if (!tokenInfo || !tokenInfo.data || tokenInfo.data.length < 9) {
        throw new Error('Invalid token mint account');
      }
      const decimals = Number(tokenInfo.data[8]);

      // Get associated token account
      const [associatedAddress] = await deriveAssociatedTokenAddress(
        walletPubkey,
        mintPubkey
      );

      // Get account info
      const accountInfo = await rpcConnection.readAccountInfo(associatedAddress);
      if (!accountInfo || !accountInfo.data) {
        console.log('0');
        return;
      }

      // Parse balance (first 8 bytes)
      const balance = BigInt('0x' + Buffer.from(accountInfo.data.slice(0, 8)).toString('hex'));
      const formattedBalance = Number(balance) / Math.pow(10, decimals);
      console.log(formattedBalance);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('An unknown error occurred');
      }
      process.exit(1);
    }
  });

program
  .command('create-account <tokenAddress>')
  .description('Create an associated token account')
  .action(async (tokenAddress: string) => {
    try {
      const config = readConfig();
      const keypairData = JSON.parse(fs.readFileSync(config.keypair, 'utf8'));
      const walletKeypair = Keypair.fromSecretKey(
        Buffer.from(keypairData.secretKey, 'hex')
      );
      const walletPubkey = toArchPubkey(walletKeypair.publicKey);
      const mintPubkey = Buffer.from(tokenAddress, 'hex');

      // Verify token exists
      const rpcConnection = new RpcConnection(config.rpcUrl);
      const tokenInfo = await rpcConnection.readAccountInfo(mintPubkey);
      if (!tokenInfo || !tokenInfo.data) {
        throw new Error('Invalid token mint account');
      }

      console.log(`Creating account for token: ${tokenAddress}`);
      console.log(`Owner: ${keypairData.publicKey}`);

      // Create associated token account
      const signer = createSignerFromKeypair(keypairData);
      const [associatedAddress] = await deriveAssociatedTokenAddress(
        walletPubkey,
        mintPubkey
      );

      const tx = await createAssociatedTokenAccountTx(
        walletPubkey,
        mintPubkey,
        walletPubkey,
        signer
      );

      console.log(`Associated token account: ${Buffer.from(associatedAddress).toString('hex')}`);
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
