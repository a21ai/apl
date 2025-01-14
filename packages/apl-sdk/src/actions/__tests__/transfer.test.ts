import { Pubkey, RuntimeTransaction, Instruction } from "@repo/arch-sdk";
import { randomPrivateKeyBytes, pubSchnorr } from "@scure/btc-signer/utils";
import { transferTx } from "../transfer.js";
import { TokenInstruction } from "../../serde/token-instruction.js";
import { TOKEN_PROGRAM_ID } from "../../constants.js";
import { SignerCallback } from "../../utils.js";

describe("transfer action", () => {
  // Create test pubkeys using the same method as create-keypair.ts
  const testPriv = randomPrivateKeyBytes();
  const testPubkey = pubSchnorr(testPriv) as Pubkey;

  describe("transferTx", () => {
    describe("with valid parameters", () => {
      it("should create transfer transaction with correct accounts and data", async () => {
        const source = testPubkey;
        const mint = testPubkey;
        const destination = testPubkey;
        const owner = testPubkey;
        const amount = BigInt(1000);
        const decimals = 9;

        const mockSigner: SignerCallback = async (message_hash: string) => "mock_signature";
        const tx = await transferTx(
          source,
          mint,
          destination,
          owner,
          amount,
          decimals,
          mockSigner
        );

        // Verify accounts
        const txInstructions = (tx as any).instructions as Instruction[];
        expect(txInstructions.length).toBeGreaterThan(0);
        const instruction = txInstructions[0];
        expect(instruction).toBeDefined();
        expect(instruction?.program_id).toEqual(TOKEN_PROGRAM_ID);
        expect(instruction?.accounts).toEqual([
          { pubkey: source, is_signer: false, is_writable: true },
          { pubkey: mint, is_signer: false, is_writable: false },
          { pubkey: destination, is_signer: false, is_writable: true },
          { pubkey: owner, is_signer: true, is_writable: false },
        ]);

        // Verify instruction data
        const data = instruction?.data;
        expect(data).toBeDefined();
        expect(data![0]).toBe(TokenInstruction.TransferChecked);
        expect(Buffer.from(data!.slice(1, 9)).readBigUInt64LE(0)).toBe(amount);
        expect(data![9]).toBe(decimals);
      });

      it("should handle large token amounts", async () => {
        const source = testPubkey;
        const mint = testPubkey;
        const destination = testPubkey;
        const owner = testPubkey;
        const amount = BigInt("9007199254740991"); // Max safe integer
        const decimals = 9;

        const mockSigner: SignerCallback = async (message_hash: string) => "mock_signature";
        const tx = await transferTx(
          source,
          mint,
          destination,
          owner,
          amount,
          decimals,
          mockSigner
        );

        const txInstructions = (tx as any).instructions as Instruction[];
        expect(txInstructions.length).toBeGreaterThan(0);
        const instruction = txInstructions[0];
        expect(instruction).toBeDefined();

        const data = instruction?.data;
        expect(data).toBeDefined();
        expect(data![0]).toBe(TokenInstruction.TransferChecked);
        expect(Buffer.from(data!.slice(1, 9)).readBigUInt64LE(0)).toBe(amount);
      });

      it("should handle different decimal places", async () => {
        const source = testPubkey;
        const mint = testPubkey;
        const destination = testPubkey;
        const owner = testPubkey;
        const amount = BigInt(1);
        const decimals = 0; // Test with 0 decimals

        const mockSigner: SignerCallback = async (message_hash: string) => "mock_signature";
        const tx = await transferTx(
          source,
          mint,
          destination,
          owner,
          amount,
          decimals,
          mockSigner
        );

        const txInstructions = (tx as any).instructions as Instruction[];
        expect(txInstructions.length).toBeGreaterThan(0);
        const instruction = txInstructions[0];
        expect(instruction).toBeDefined();

        const data = instruction?.data;
        expect(data).toBeDefined();
        expect(data![0]).toBe(TokenInstruction.TransferChecked);
        expect(Buffer.from(data!.slice(1, 9)).readBigUInt64LE(0)).toBe(amount);
        expect(data![9]).toBe(decimals);
      });
    });
  });
});
