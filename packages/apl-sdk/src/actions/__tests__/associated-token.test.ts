import { Pubkey, UtxoMetaData, RuntimeTransaction, Instruction } from "@repo/arch-sdk";
import { randomPrivateKeyBytes, pubSchnorr } from "@scure/btc-signer/utils";
import { associatedTokenTx } from "../associated-token.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, SYSTEM_PROGRAM_ID } from "../../constants.js";
import { SignerCallback } from "../../utils.js";

describe("associated-token action", () => {
  // Create test pubkeys using the same method as create-keypair.ts
  const testPriv = randomPrivateKeyBytes();
  const testPubkey = pubSchnorr(testPriv) as Pubkey;

  describe("associatedTokenTx", () => {
    describe("with valid parameters", () => {
      it("should create associated token transaction with correct accounts", async () => {
        const owner = testPubkey;
        const mint = testPubkey;
        const associatedToken = testPubkey;
        const utxo = { txid: "0".repeat(64), vout: 0 };

        const mockSigner: SignerCallback = async (message_hash: string) => "mock_signature";
        const tx = await associatedTokenTx(utxo, associatedToken, owner, mint, mockSigner);

        // Verify instruction
        const txInstructions = (tx as any).instructions as Instruction[];
        expect(txInstructions.length).toBeGreaterThan(0);
        const instruction = txInstructions[0];
        expect(instruction).toBeDefined();
        expect(instruction?.program_id).toEqual(ASSOCIATED_TOKEN_PROGRAM_ID);
        expect(instruction?.accounts).toEqual([
          { pubkey: associatedToken, is_signer: false, is_writable: true },
          { pubkey: owner, is_signer: false, is_writable: false },
          { pubkey: mint, is_signer: false, is_writable: false },
          { pubkey: SYSTEM_PROGRAM_ID, is_signer: false, is_writable: false },
          { pubkey: TOKEN_PROGRAM_ID, is_signer: false, is_writable: false },
        ]);

        // Verify data format (36 bytes utxo + 32 bytes system program)
        const data = instruction?.data;
        expect(data).toBeDefined();
        expect(data!.length).toBe(68);
        expect(Buffer.from(data!.slice(36, 68))).toEqual(Buffer.from(SYSTEM_PROGRAM_ID));
      });

      it("should handle different UTXO values", async () => {
        const owner = testPubkey;
        const mint = testPubkey;
        const associatedToken = testPubkey;
        const utxo = { txid: "1".repeat(64), vout: 1 }; // Different UTXO values

        const mockSigner: SignerCallback = async (message_hash: string) => "mock_signature";
        const tx = await associatedTokenTx(utxo, associatedToken, owner, mint, mockSigner);

        const txInstructions = (tx as any).instructions as Instruction[];
        expect(txInstructions.length).toBeGreaterThan(0);
        const instruction = txInstructions[0];
        expect(instruction).toBeDefined();

        // Verify data format with different UTXO
        const data = instruction?.data;
        expect(data).toBeDefined();
        expect(data!.length).toBe(68);
        // First 36 bytes should be different due to different UTXO
        expect(Buffer.from(data!.slice(0, 36))).not.toEqual(Buffer.alloc(36, 0));
        // Last 32 bytes should still be SYSTEM_PROGRAM_ID
        expect(Buffer.from(data!.slice(36, 68))).toEqual(Buffer.from(SYSTEM_PROGRAM_ID));
      });

      it("should handle maximum vout value", async () => {
        const owner = testPubkey;
        const mint = testPubkey;
        const associatedToken = testPubkey;
        const utxo = { txid: "f".repeat(64), vout: 4294967295 }; // Max uint32

        const mockSigner: SignerCallback = async (message_hash: string) => "mock_signature";
        const tx = await associatedTokenTx(utxo, associatedToken, owner, mint, mockSigner);

        const txInstructions = (tx as any).instructions as Instruction[];
        const instruction = txInstructions[0];
        expect(instruction).toBeDefined();

        const data = instruction?.data;
        expect(data).toBeDefined();
        expect(data!.length).toBe(68);
        // Verify the data still maintains correct structure with max vout
        expect(Buffer.from(data!.slice(36, 68))).toEqual(Buffer.from(SYSTEM_PROGRAM_ID));
      });
    });
  });
});
