import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "../../constants.js";
import { secp256k1 } from "@noble/curves/secp256k1";
import {
  getAssociatedTokenAddress,
  findProgramAddress,
  MAX_SEED_LENGTH,
  MAX_SEEDS,
} from "../associated-token.js";

describe("associated-token", () => {
  const mint = Buffer.alloc(32, 1);
  const owner = Buffer.alloc(32, 2);

  describe("getAssociatedTokenAddress", () => {
    it("should throw error for owner not on curve when allowOwnerOffCurve is false", () => {
      expect(() =>
        getAssociatedTokenAddress(
          mint,
          owner,
          false,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      ).toThrow(/Owner is not on curve/);
    });

    it("should not throw for invalid owner when allowOwnerOffCurve is true", () => {
      expect(() =>
        getAssociatedTokenAddress(
          mint,
          owner,
          true,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      ).not.toThrow();
    });

    it("should not throw for valid owner regardless of allowOwnerOffCurve", () => {
      // Create a valid secp256k1 key pair
      const privateKey = Buffer.alloc(32, 1);
      // Get uncompressed public key (65 bytes) and take just the x-coordinate (32 bytes)
      const uncompressedPubKey = secp256k1.getPublicKey(privateKey, false);
      const publicKey = Buffer.from(uncompressedPubKey.slice(1, 33));

      // Test with allowOwnerOffCurve = true (should not throw)
      expect(() =>
        getAssociatedTokenAddress(
          mint,
          publicKey,
          true,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      ).not.toThrow();

      // Test with allowOwnerOffCurve = false (should throw since x-coordinate alone is not a valid point)
      expect(() =>
        getAssociatedTokenAddress(
          mint,
          publicKey,
          false,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      ).toThrow("Owner is not on curve");
    });

    it("should derive associated token address", () => {
      const address = getAssociatedTokenAddress(mint, owner);
      expect(address).toBeInstanceOf(Uint8Array);
      expect(address.length).toBe(32);
    });

    it("should derive same address for same inputs", () => {
      const address1 = getAssociatedTokenAddress(mint, owner);
      const address2 = getAssociatedTokenAddress(mint, owner);
      expect(address1).toEqual(address2);
    });

    it("should derive different addresses for different mints", () => {
      const mint2 = new Uint8Array(32).fill(3);
      const address1 = getAssociatedTokenAddress(mint, owner);
      const address2 = getAssociatedTokenAddress(mint2, owner);
      expect(address1).not.toEqual(address2);
    });

    it("should derive different addresses for different owners", () => {
      const owner2 = new Uint8Array(32).fill(3);
      const address1 = getAssociatedTokenAddress(mint, owner);
      const address2 = getAssociatedTokenAddress(mint, owner2);
      expect(address1).not.toEqual(address2);
    });

    it("should use provided program IDs", () => {
      const customTokenProgramId = new Uint8Array(32).fill(4);
      const customAssociatedTokenProgramId = new Uint8Array(32).fill(5);

      const address1 = getAssociatedTokenAddress(mint, owner);
      const address2 = getAssociatedTokenAddress(
        mint,
        owner,
        true,
        customTokenProgramId,
        customAssociatedTokenProgramId
      );

      expect(address1).not.toEqual(address2);
    });

    it("should use default program IDs", () => {
      const address1 = getAssociatedTokenAddress(mint, owner);
      const address2 = getAssociatedTokenAddress(
        mint,
        owner,
        true,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      expect(address1).toEqual(address2);
    });

    it("should handle program address derivation with different nonces", () => {
      const seeds = [owner, TOKEN_PROGRAM_ID, mint];
      const address = getAssociatedTokenAddress(mint, owner);
      expect(address).toBeDefined();
      expect(address.length).toBe(32);
    });

    it("should throw error for seeds exceeding max length", () => {
      const longMint = new Uint8Array(MAX_SEED_LENGTH + 1).fill(1);
      expect(() => getAssociatedTokenAddress(longMint, owner)).toThrow(
        /Max seed length exceeded/
      );
    });

    it("should throw error for too many seeds", () => {
      // Create an array of MAX_SEEDS + 1 seeds
      const tooManySeeds = Array(MAX_SEEDS + 1).fill(Buffer.alloc(1));

      expect(() =>
        findProgramAddress(tooManySeeds, ASSOCIATED_TOKEN_PROGRAM_ID)
      ).toThrow(/Max seeds exceeded/);
    });

    it("should throw error if no valid program address is found", () => {
      // Mock the isOnCurve function to always return true, forcing the loop to exhaust all nonces
      jest
        .spyOn(secp256k1.ProjectivePoint, "fromHex")
        .mockImplementation(() => {
          return {} as any;
        });

      expect(() => getAssociatedTokenAddress(mint, owner)).toThrow(
        "Unable to find a viable program address nonce"
      );

      jest.restoreAllMocks();
    });

    it("should handle errors in program address derivation", () => {
      // Mock Buffer.concat to throw TypeError
      const originalConcat = Buffer.concat;
      Buffer.concat = jest.fn().mockImplementation(() => {
        throw new TypeError("Mock TypeError");
      });

      expect(() => getAssociatedTokenAddress(mint, owner)).toThrow(
        "Mock TypeError"
      );

      Buffer.concat = originalConcat;
    });
  });

  describe("Constants", () => {
    it("should have correct MAX_SEED_LENGTH", () => {
      expect(MAX_SEED_LENGTH).toBe(32);
    });

    it("should have correct MAX_SEEDS", () => {
      expect(MAX_SEEDS).toBe(16);
    });
  });
});
