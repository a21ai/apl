import { Pubkey } from "@repo/arch-sdk";
import { randomPrivateKeyBytes, pubSchnorr } from "@scure/btc-signer/utils";
import { Mint, serialize, deserialize, MINT_LEN } from "../mint.js";

describe("mint serialization", () => {
  // Create test pubkeys using the same method as create-keypair.ts
  const mintAuthPriv = randomPrivateKeyBytes();
  const testMintAuthority = pubSchnorr(mintAuthPriv) as Pubkey;

  const freezeAuthPriv = randomPrivateKeyBytes();
  const testFreezeAuthority = pubSchnorr(freezeAuthPriv) as Pubkey;

  const createTestMint = (overrides: Partial<Mint> = {}): Mint => ({
    mint_authority: testMintAuthority,
    supply: BigInt(1000),
    decimals: 9,
    is_initialized: true,
    freeze_authority: testFreezeAuthority,
    ...overrides,
  });

  describe("serialize", () => {
    it("should correctly serialize a mint with all fields", () => {
      const mint = createTestMint();
      const result = serialize(mint);

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBe(MINT_LEN);

      // Check mint authority (36 bytes: 4 byte tag + 32 byte pubkey)
      expect(result.slice(0, 4)).toEqual(Buffer.from([1, 0, 0, 0])); // Some tag
      expect(result.slice(4, 36)).toEqual(Buffer.from(testMintAuthority));

      // Check supply (8 bytes)
      expect(result.readBigUInt64LE(36)).toBe(BigInt(1000));

      // Check decimals (1 byte)
      expect(result[44]).toBe(9);

      // Check is_initialized (1 byte)
      expect(result[45]).toBe(1);

      // Check freeze authority (36 bytes: 4 byte tag + 32 byte pubkey)
      expect(result.slice(46, 50)).toEqual(Buffer.from([1, 0, 0, 0])); // Some tag
      expect(result.slice(50, 82)).toEqual(Buffer.from(testFreezeAuthority));
    });

    it("should correctly serialize a mint with null authorities", () => {
      const mint = createTestMint({
        mint_authority: null,
        freeze_authority: null,
      });
      const result = serialize(mint);

      // Check mint authority is None
      expect(result.slice(0, 4)).toEqual(Buffer.from([0, 0, 0, 0]));
      expect(result.slice(4, 36)).toEqual(Buffer.alloc(32, 0));

      // Check freeze authority is None
      expect(result.slice(46, 50)).toEqual(Buffer.from([0, 0, 0, 0]));
      expect(result.slice(50, 82)).toEqual(Buffer.alloc(32, 0));
    });

    it("should correctly serialize an uninitialized mint", () => {
      const mint = createTestMint({ is_initialized: false });
      const result = serialize(mint);
      expect(result[45]).toBe(0);
    });
  });

  describe("deserialize", () => {
    it("should correctly deserialize a mint with all fields", () => {
      const mint = createTestMint();
      const serialized = serialize(mint);
      const result = deserialize(serialized);

      expect(result.mint_authority ? Buffer.from(result.mint_authority) : null).toEqual(Buffer.from(testMintAuthority));
      expect(result.supply).toBe(BigInt(1000));
      expect(result.decimals).toBe(9);
      expect(result.is_initialized).toBe(true);
      expect(result.freeze_authority ? Buffer.from(result.freeze_authority) : null).toEqual(Buffer.from(testFreezeAuthority));
    });

    it("should correctly deserialize a mint with null authorities", () => {
      const mint = createTestMint({
        mint_authority: null,
        freeze_authority: null,
      });
      const serialized = serialize(mint);
      const result = deserialize(serialized);

      expect(result.mint_authority).toBeNull();
      expect(result.freeze_authority).toBeNull();
    });

    it("should throw error for invalid buffer length", () => {
      const invalidBuffer = Buffer.alloc(MINT_LEN - 1);
      expect(() => deserialize(invalidBuffer)).toThrow("Invalid buffer length");
    });

    it("should throw error for invalid is_initialized value", () => {
      const mint = createTestMint();
      const serialized = serialize(mint);
      serialized[45] = 2; // Set invalid is_initialized value
      expect(() => deserialize(serialized)).toThrow(
        "Invalid is_initialized value"
      );
    });
  });
});
