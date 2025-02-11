import { Pubkey } from "@repo/arch-sdk";
import { randomPrivateKeyBytes, pubSchnorr } from "@scure/btc-signer/utils";
import { Pool, serialize, deserialize, POOL_LEN } from "../pool.js";

describe("pool state serialization", () => {
  // Create test pubkeys using the same method as create-keypair.ts
  const createTestPubkey = () => {
    const testPriv = randomPrivateKeyBytes();
    return pubSchnorr(testPriv) as Pubkey;
  };

  describe("serialize and deserialize", () => {
    it("should correctly round-trip pool state", () => {
      const pool: Pool = {
        tokenA: createTestPubkey(),
        tokenB: createTestPubkey(),
        lpMint: createTestPubkey(),
        tokenAVault: createTestPubkey(),
        tokenBVault: createTestPubkey(),
        feeNumerator: 25,
        feeDenominator: 10000,
        isInitialized: true,
      };

      const serialized = serialize(pool);
      const deserialized = deserialize(serialized);

      expect(Buffer.from(deserialized.tokenA)).toEqual(Buffer.from(pool.tokenA));
      expect(Buffer.from(deserialized.tokenB)).toEqual(Buffer.from(pool.tokenB));
      expect(Buffer.from(deserialized.lpMint)).toEqual(Buffer.from(pool.lpMint));
      expect(Buffer.from(deserialized.tokenAVault)).toEqual(Buffer.from(pool.tokenAVault));
      expect(Buffer.from(deserialized.tokenBVault)).toEqual(Buffer.from(pool.tokenBVault));
      expect(deserialized.feeNumerator).toBe(pool.feeNumerator);
      expect(deserialized.feeDenominator).toBe(pool.feeDenominator);
      expect(deserialized.isInitialized).toBe(pool.isInitialized);
    });

    it("should throw error for invalid buffer length", () => {
      const invalidBuffer = Buffer.alloc(POOL_LEN - 1);
      expect(() => deserialize(invalidBuffer)).toThrow("Invalid buffer length");
    });

    it("should throw error for invalid is_initialized value", () => {
      const invalidBuffer = Buffer.alloc(POOL_LEN);
      invalidBuffer[164] = 2; // Invalid value, should be 0 or 1
      expect(() => deserialize(invalidBuffer)).toThrow("Invalid is_initialized value");
    });

    it("should handle uninitialized pool", () => {
      const pool: Pool = {
        tokenA: createTestPubkey(),
        tokenB: createTestPubkey(),
        lpMint: createTestPubkey(),
        tokenAVault: createTestPubkey(),
        tokenBVault: createTestPubkey(),
        feeNumerator: 25,
        feeDenominator: 10000,
        isInitialized: false,
      };

      const serialized = serialize(pool);
      const deserialized = deserialize(serialized);

      expect(deserialized.isInitialized).toBe(false);
    });
  });
});
