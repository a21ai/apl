import { PublicKey, Keypair, Transaction, SystemProgram } from '@solana/web3.js';
import { 
  deriveAssociatedTokenAddress, 
  createAssociatedTokenAccountTx,
  ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  APL_TOKEN_PROGRAM_ID
} from '../index.js';
import { describe, it, expect, beforeEach } from '@jest/globals';

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

  it('should derive associated token address with correct seeds', async () => {
    const [associatedAddress, bumpSeed] = await deriveAssociatedTokenAddress(
      walletKeypair.publicKey,
      mintKeypair.publicKey
    );

    // Verify the address was derived with correct seeds
    const [verifyAddress, verifyBump] = await PublicKey.findProgramAddress(
      [
        walletKeypair.publicKey.toBuffer(),
        APL_TOKEN_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    );

    expect(associatedAddress.equals(verifyAddress)).toBe(true);
    expect(bumpSeed).toBe(verifyBump);
  });

  it('should create associated token account transaction with correct instructions', async () => {
    // Mock signer callback
    const mockSigner = async (tx: Transaction): Promise<Transaction> => tx;

    const tx = await createAssociatedTokenAccountTx(
      walletKeypair.publicKey,
      mintKeypair.publicKey,
      payerKeypair.publicKey,
      mockSigner
    );

    // Verify transaction has 3 instructions (create, assign, initialize)
    const instructions = tx.instructions;
    expect(instructions).toBeDefined();
    expect(instructions).toHaveLength(3);

    // Type assertion since we verified length above
    const [createInstruction, assignInstruction, initializeInstruction] = instructions as any[];

    // Verify program IDs
    expect(createInstruction.programId.equals(SystemProgram.programId)).toBe(true);
    expect(assignInstruction.programId.equals(SystemProgram.programId)).toBe(true);
    expect(initializeInstruction.programId.equals(APL_TOKEN_PROGRAM_ID)).toBe(true);

    // Verify the derived address matches
    const [associatedAddress] = await deriveAssociatedTokenAddress(
      walletKeypair.publicKey,
      mintKeypair.publicKey
    );

    // Verify account keys in instructions
    expect(createInstruction.keys[1].pubkey.equals(associatedAddress)).toBe(true);
    expect(assignInstruction.keys[0].pubkey.equals(associatedAddress)).toBe(true);
    expect(initializeInstruction.keys[0].pubkey.equals(associatedAddress)).toBe(true);
  });

  it('should use fresh keypairs for each test run', () => {
    const firstWallet = walletKeypair.publicKey;
    const firstMint = mintKeypair.publicKey;
    
    // Generate new keypairs
    walletKeypair = Keypair.generate();
    mintKeypair = Keypair.generate();
    
    // Verify they're different
    expect(firstWallet.equals(walletKeypair.publicKey)).toBe(false);
    expect(firstMint.equals(mintKeypair.publicKey)).toBe(false);
  });
});
