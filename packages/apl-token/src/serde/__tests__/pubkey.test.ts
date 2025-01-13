import { Pubkey } from "@repo/arch-sdk";
import { randomPrivateKeyBytes, pubSchnorr } from "@scure/btc-signer/utils";
import {
  serializePubkey,
  serializeOptionPubkey,
  deserializeOptionPubkey,
} from "../pubkey.js";

describe("pubkey serialization", () => {
  // Create test pubkeys using the same method as create-keypair.ts
  const testPriv = randomPrivateKeyBytes();
  const testPubkey = pubSchnorr(testPriv) as Pubkey;

  // Use a valid private key for testing (1 in this case)
  const testPriv2 = new Uint8Array(32);
  testPriv2[31] = 1; // Set last byte to 1 for a valid private key
  const testPubkey2 = pubSchnorr(testPriv2) as Pubkey;

  describe("serializePubkey", () => {
    it("should correctly serialize a pubkey", () => {
      const result = serializePubkey(testPubkey);
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBe(32);
      expect(Buffer.from(result)).toEqual(Buffer.from(testPubkey));
    });
  });

  describe("serializeOptionPubkey", () => {
    it("should serialize null as None variant", () => {
      const result = serializeOptionPubkey(null);
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBe(36);
      expect(result.slice(0, 4)).toEqual(Buffer.from([0, 0, 0, 0])); // None tag
      expect(result.slice(4)).toEqual(Buffer.alloc(32, 0)); // Zero padding
    });

    it("should serialize pubkey as Some variant", () => {
      const result = serializeOptionPubkey(testPubkey);
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBe(36);
      expect(result.slice(0, 4)).toEqual(Buffer.from([1, 0, 0, 0])); // Some tag
      expect(result.slice(4)).toEqual(Buffer.from(testPubkey));
    });
  });

  describe("deserializeOptionPubkey", () => {
    it("should deserialize None variant correctly", () => {
      const serialized = Buffer.concat([
        Buffer.from([0, 0, 0, 0]), // None tag
        Buffer.alloc(32, 0), // Zero padding
      ]);
      const result = deserializeOptionPubkey(serialized);
      expect(result).toBeNull();
    });

    it("should deserialize Some variant correctly", () => {
      const serialized = Buffer.concat([
        Buffer.from([1, 0, 0, 0]), // Some tag
        Buffer.from(testPubkey),
      ]);
      const result = deserializeOptionPubkey(serialized);
      expect(result).not.toBeNull();
      expect(Buffer.compare(result as Buffer, Buffer.from(testPubkey))).toBe(0);
    });

    it("should throw error for invalid tag", () => {
      const serialized = Buffer.concat([
        Buffer.from([2, 0, 0, 0]), // Invalid tag
        Buffer.from(testPubkey),
      ]);
      expect(() => deserializeOptionPubkey(serialized)).toThrow(
        "Invalid option tag: 2"
      );
    });
  });
});
