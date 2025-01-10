import { Keypair } from '@solana/web3.js';
import { 
  deriveAssociatedTokenAddress, 
  createAssociatedTokenAccountTx,
  ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  APL_TOKEN_PROGRAM_ID,
  toArchPubkey
} from '../index.js';
import { PubkeyUtil, RuntimeTransaction } from '@repo/arch-sdk';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { sha256 } from '@noble/hashes/sha2';

describe('Associated Token Account', () => {
  let walletKeypair: Keypair;
  let mintKeypair: Keypair;
  let payerKeypair: Keypair;

  beforeEach(() => {
    // Generate fresh keypairs for each test
    walletKeypair = Keypair.generate();
    mintKeypair = Keypair.generate();
    payerKeypair = Keypair.generate();
  });

  it('should derive associated token address with correct seeds', () => {
    const [associatedAddress, bumpSeed] = deriveAssociatedTokenAddress(
      toArchPubkey(walletKeypair.publicKey),
      toArchPubkey(mintKeypair.publicKey)
    );

    // Verify the address was derived with correct seeds
    // Verify using the same PDA derivation logic
    const seeds = Buffer.concat([
      Buffer.from(toArchPubkey(walletKeypair.publicKey)),
      Buffer.from(APL_TOKEN_PROGRAM_ID),
      Buffer.from(toArchPubkey(mintKeypair.publicKey))
    ]);
    
    const programId = Buffer.from(ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID);
    const hash = sha256(Buffer.concat([seeds, programId]));

    const hashArray = new Uint8Array(hash);
    const verifyAddress = hashArray.slice(0, 32);
    const verifyBump = hashArray[31];

    expect(Buffer.compare(associatedAddress, verifyAddress)).toBe(0);
    expect(bumpSeed).toBe(verifyBump);
  });

  it('should create associated token account transaction with correct instructions', async () => {
    const mockSigner = async (tx: RuntimeTransaction): Promise<RuntimeTransaction> => tx;

    const tx = await createAssociatedTokenAccountTx(
      toArchPubkey(walletKeypair.publicKey),
      toArchPubkey(mintKeypair.publicKey),
      toArchPubkey(payerKeypair.publicKey),
      mockSigner
    );

    // Verify transaction has correct instructions
    expect(tx.message.instructions).toBeDefined();
    expect(tx.message.instructions.length).toBe(3);

    // Verify program IDs
    expect(tx.message.instructions.length).toBe(3);
    const [create, assign, init] = tx.message.instructions;
    
    expect(create && Buffer.compare(create.program_id, APL_TOKEN_PROGRAM_ID)).toBe(0);
    expect(assign && Buffer.compare(assign.program_id, APL_TOKEN_PROGRAM_ID)).toBe(0);
    expect(init && Buffer.compare(init.program_id, APL_TOKEN_PROGRAM_ID)).toBe(0);

    // Verify the derived address matches
    const [associatedAddress] = await deriveAssociatedTokenAddress(
      toArchPubkey(walletKeypair.publicKey),
      toArchPubkey(mintKeypair.publicKey)
    );

    // Verify account keys in instructions
    // Verify create instruction
    expect(create).toBeDefined();
    if (!create || !create.accounts[1] || !create.accounts[1].pubkey) {
      throw new Error('Create instruction or its accounts are undefined');
    }
    expect(Buffer.compare(create.accounts[1].pubkey, associatedAddress)).toBe(0);

    // Verify assign instruction
    expect(assign).toBeDefined();
    if (!assign || !assign.accounts[0] || !assign.accounts[0].pubkey) {
      throw new Error('Assign instruction or its accounts are undefined');
    }
    expect(Buffer.compare(assign.accounts[0].pubkey, associatedAddress)).toBe(0);

    // Verify init instruction
    expect(init).toBeDefined();
    if (!init || !init.accounts[0] || !init.accounts[0].pubkey) {
      throw new Error('Init instruction or its accounts are undefined');
    }
    expect(Buffer.compare(init.accounts[0].pubkey, associatedAddress)).toBe(0);
  });

  it('should use fresh keypairs for each test run', () => {
    const firstWallet = walletKeypair.publicKey;
    const firstMint = mintKeypair.publicKey;
    
    // Generate new keypairs
    walletKeypair = Keypair.generate();
    mintKeypair = Keypair.generate();
    
    // Verify they're different
    expect(Buffer.compare(
      toArchPubkey(firstWallet),
      toArchPubkey(walletKeypair.publicKey)
    )).not.toBe(0);
    expect(Buffer.compare(
      toArchPubkey(firstMint),
      toArchPubkey(mintKeypair.publicKey)
    )).not.toBe(0);
  });
});
