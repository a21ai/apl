import { Keypair } from '@solana/web3.js';
import { Pubkey, ArchConnection, Arch } from "@saturnbtcio/arch-sdk";
import { mintTo, createMint, getOrCreateAssociatedTokenAccount } from '../../src/index';

// Mock connection factory function
const createMockConnection = () => {
  // Return a function matching (provider: Provider) => Arch signature
  return (_provider: any) => ({} as Arch);
};

describe('APL Token Tests', () => {
  test('mintTo - basic logs', () => {
    const dummyMint = new Uint8Array([1, 2, 3, 4]);
    const dummyTo = new Uint8Array([5, 6, 7, 8]);
    const dummyAmount = 100;
    // For now, just verifying it runs without throwing
    mintTo(dummyMint, dummyTo, dummyAmount);
  });

  test('createMint - handles basic args', () => {
    const dummyConnection = createMockConnection();
    const dummyMintAuthority = new Uint8Array([1, 2, 3, 4]);
    const dummyFreezeAuthority = new Uint8Array([5, 6, 7, 8]);
    const decimals = 9;
    createMint(dummyConnection, dummyMintAuthority, dummyFreezeAuthority, decimals);
  });

  test('getOrCreateAssociatedTokenAccount - handles basic args', () => {
    const dummyConnection = createMockConnection();
    const dummyPayer = Keypair.generate();
    const dummyMint = new Uint8Array([1, 2, 3, 4]);
    const dummyOwner = new Uint8Array([5, 6, 7, 8]);
    const enablePDAOwner = true;
    getOrCreateAssociatedTokenAccount(dummyConnection, dummyPayer, dummyMint, dummyOwner, enablePDAOwner);
  });
});
