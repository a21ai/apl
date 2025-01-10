import { Keypair } from '@solana/web3.js';
import { RuntimeTransaction } from '../struct/runtime-transaction.js';

/**
 * Create a signer callback that uses a Solana keypair
 * @param secretKey Hex-encoded secret key or Uint8Array
 * @returns SignerCallback function
 */
export function createSignerFromSecretKey(secretKey: string | Uint8Array): (transaction: RuntimeTransaction) => Promise<RuntimeTransaction> {
  const keyBytes = typeof secretKey === 'string' 
    ? Buffer.from(secretKey, 'hex')
    : secretKey;
  const keypair = Keypair.fromSecretKey(new Uint8Array(keyBytes));
  
  return async (transaction: RuntimeTransaction): Promise<RuntimeTransaction> => {
    // TODO: Implement actual transaction signing
    // For now, just return the transaction as is (stub)
    return transaction;
  };
}

/**
 * Type definition for transaction signing callbacks
 */
export type SignerCallback = (transaction: RuntimeTransaction) => Promise<RuntimeTransaction>;
