import fs from 'fs';
import { Keypair } from '@solana/web3.js';
import { RpcConnection, RuntimeTransaction, PubkeyUtil, Pubkey } from '@repo/arch-sdk';
import { readConfig } from './config.js';

/**
 * Callback function for signing transactions
 */
type SignerCallback = (transaction: RuntimeTransaction) => Promise<RuntimeTransaction>;

/**
 * Load keypair from config file
 * @returns {Keypair} Loaded keypair
 * @throws {Error} If keypair file cannot be read or is invalid
 */
export function loadKeypair(): Keypair {
  const config = readConfig();
  try {
    const keypairData = JSON.parse(fs.readFileSync(config.keypair, 'utf8'));
    return Keypair.fromSecretKey(Buffer.from(keypairData.secretKey, 'hex'));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load keypair: ${error.message}`);
    }
    throw new Error('Failed to load keypair: Unknown error');
  }
}

/**
 * Create RPC connection from config
 * @returns {RpcConnection} Configured RPC connection
 */
export function createRpcConnection(): RpcConnection {
  const config = readConfig();
  return new RpcConnection(config.rpcUrl);
}

/**
 * Create a signer callback that uses the keypair's secret key
 * @param keypairData Keypair data with secretKey
 * @returns SignerCallback function
 */
export function createSignerFromKeypair(keypairData: { secretKey: string }): SignerCallback {
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
}

/**
 * Handle errors consistently across commands
 * @param error Error to handle
 */
export function handleError(error: unknown): never {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  } else {
    console.error('An unknown error occurred');
  }
  process.exit(1);
}

/**
 * Load keypair data and convert public key to Arch format
 * @returns {Object} Object containing keypair data and Arch pubkey
 */
export function loadKeypairWithPubkey() {
  const config = readConfig();
  const keypairData = JSON.parse(fs.readFileSync(config.keypair, 'utf8'));
  const keypair = Keypair.fromSecretKey(Buffer.from(keypairData.secretKey, 'hex'));
  const pubkey = PubkeyUtil.fromHex(Buffer.from(keypair.publicKey.toBytes()).toString('hex'));
  return { keypairData, keypair, pubkey };
}
