import { PublicKey, Keypair } from '@solana/web3.js';
import { 
  TokenInstruction, 
  AuthorityType, 
  serializeInstruction, 
  serializeU64LE, 
  serializeOptionPubkey, 
  APL_TOKEN_PROGRAM_ID,
  toArchPubkey 
} from '../index.js';
import { PubkeyUtil } from '@repo/arch-sdk';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('Token Instruction Serialization', () => {
  let testKeypair: Keypair;
  let testKeypair2: Keypair;
  let testKeypair3: Keypair;

  beforeEach(() => {
    testKeypair = Keypair.generate();
    testKeypair2 = Keypair.generate();
    testKeypair3 = Keypair.generate();
  });

  it('should serialize InitializeMint instruction correctly', () => {
    const data = {
      decimals: 2,
      mint_authority: testKeypair.publicKey,
      freeze_authority: null,
    };
    const result = serializeInstruction(TokenInstruction.InitializeMint, data);
    
    // Expected: [0, 2, ...TEST_PUBKEY(32), 0,0,0,0]
    const expected = Buffer.concat([
      Buffer.from([0]), // instruction tag
      Buffer.from([2]), // decimals
      Buffer.from(testKeypair.publicKey.toBytes()), // mint_authority
      Buffer.from([0, 0, 0, 0]), // freeze_authority: None
    ]);
    
    expect(Buffer.compare(result, expected)).toBe(0);
  });

  it('should serialize Transfer instruction correctly', () => {
    const data = { amount: 1 };
    const result = serializeInstruction(TokenInstruction.Transfer, data);
    
    // Expected: [3, 1,0,0,0,0,0,0,0]
    const expected = Buffer.concat([
      Buffer.from([3]), // instruction tag
      Buffer.alloc(8, 0), // amount=1 in little-endian
    ]);
    expected.writeBigUInt64LE(BigInt(1), 1);
    
    expect(Buffer.compare(result, expected)).toBe(0);
  });

  it('should serialize Approve instruction correctly', () => {
    const data = { amount: 1 };
    const result = serializeInstruction(TokenInstruction.Approve, data);
    
    // Expected: [4, 1,0,0,0,0,0,0,0]
    const expected = Buffer.concat([
      Buffer.from([4]), // instruction tag
      Buffer.alloc(8, 0), // amount=1 in little-endian
    ]);
    expected.writeBigUInt64LE(BigInt(1), 1);
    
    expect(Buffer.compare(result, expected)).toBe(0);
  });

  it('should serialize SetAuthority instruction correctly', () => {
    const data = {
      authority_type: AuthorityType.MintTokens,
      new_authority: testKeypair2.publicKey,
    };
    const result = serializeInstruction(TokenInstruction.SetAuthority, data);
    
    // Expected: [6, authority_type(1), 1,0,0,0, ...TEST_PUBKEY_2(32)]
    const expected = Buffer.concat([
      Buffer.from([6]), // instruction tag
      Buffer.from([AuthorityType.MintTokens]), // authority type
      Buffer.from([1, 0, 0, 0]), // Some
      Buffer.from(testKeypair2.publicKey.toBytes()), // new_authority
    ]);
    
    expect(Buffer.compare(result, expected)).toBe(0);
  });

  it('should serialize MintTo instruction correctly', () => {
    const data = { amount: 1 };
    const result = serializeInstruction(TokenInstruction.MintTo, data);
    
    // Expected: [7, 1,0,0,0,0,0,0,0]
    const expected = Buffer.concat([
      Buffer.from([7]), // instruction tag
      Buffer.alloc(8, 0), // amount=1 in little-endian
    ]);
    expected.writeBigUInt64LE(BigInt(1), 1);
    
    expect(Buffer.compare(result, expected)).toBe(0);
  });

  it('should serialize Burn instruction correctly', () => {
    const data = { amount: 1 };
    const result = serializeInstruction(TokenInstruction.Burn, data);
    
    // Expected: [8, 1,0,0,0,0,0,0,0]
    const expected = Buffer.concat([
      Buffer.from([8]), // instruction tag
      Buffer.alloc(8, 0), // amount=1 in little-endian
    ]);
    expected.writeBigUInt64LE(BigInt(1), 1);
    
    expect(Buffer.compare(result, expected)).toBe(0);
  });

  it('should handle edge cases in serializeU64LE', () => {
    // Test max safe integer
    const maxSafe = serializeU64LE(Number.MAX_SAFE_INTEGER);
    expect(maxSafe.length).toBe(8);
    
    // Test BigInt
    const bigNum = serializeU64LE(BigInt('9007199254740991'));
    expect(bigNum.length).toBe(8);
    
    // Test zero
    const zero = serializeU64LE(0);
    expect(Buffer.compare(zero, Buffer.alloc(8, 0))).toBe(0);
  });

  it('should handle edge cases in serializeOptionPubkey', () => {
    // Test null pubkey
    const nullPubkey = serializeOptionPubkey(null);
    expect(Buffer.compare(nullPubkey, Buffer.from([0, 0, 0, 0]))).toBe(0);
    
    // Test Some pubkey
    const somePubkey = serializeOptionPubkey(toArchPubkey(testKeypair.publicKey));
    expect(somePubkey.length).toBe(36); // 4 bytes tag + 32 bytes pubkey
    expect(Buffer.compare(somePubkey.slice(0, 4), Buffer.from([1, 0, 0, 0]))).toBe(0);
  });
});

describe('APL Token Program ID', () => {
  it('should match Rust implementation program ID bytes', () => {
    const expectedBytes = Buffer.alloc(32);
    Buffer.from("apl-token").copy(expectedBytes);
    // Convert PublicKey bytes to Buffer for comparison
    const actualBytes = Buffer.from(APL_TOKEN_PROGRAM_ID);
    expect(actualBytes).toEqual(expectedBytes);
  });
});
