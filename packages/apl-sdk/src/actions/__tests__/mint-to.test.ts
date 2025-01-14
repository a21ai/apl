import { Pubkey, RuntimeTransaction, Instruction } from "@repo/arch-sdk";
import { randomPrivateKeyBytes, pubSchnorr } from "@scure/btc-signer/utils";
import { mintToTx } from "../mint-to.js";
import { TokenInstruction } from "../../serde/token-instruction.js";
import { TOKEN_PROGRAM_ID } from "../../constants.js";
import { SignerCallback } from "../../utils.js";

describe("mint-to action", () => {
  // Create test pubkeys using the same method as create-keypair.ts
  const testPriv = randomPrivateKeyBytes();
  const testPubkey = pubSchnorr(testPriv) as Pubkey;

  describe("mintToTx", () => {
    describe("with valid parameters", () => {
      it("should create mint-to transaction with correct accounts and data", async () => {
        const amount = BigInt(1000);
        const recipient = testPubkey;
        const mint = testPubkey;
        const mintAuthority = testPubkey;

        const mockSigner: SignerCallback = async (message_hash: string) => "mock_signature";
        const tx = await mintToTx(mint, recipient, amount, mintAuthority, mockSigner);

        // Verify accounts
        const txInstructions = (tx as any).instructions as Instruction[];
        expect(txInstructions.length).toBeGreaterThan(0);
        const instruction = txInstructions[0];
        expect(instruction).toBeDefined();
        expect(instruction?.program_id).toEqual(TOKEN_PROGRAM_ID);
        expect(instruction?.accounts).toEqual([
          { pubkey: mint, is_signer: false, is_writable: true },
          { pubkey: recipient, is_signer: false, is_writable: true },
          { pubkey: mintAuthority, is_signer: true, is_writable: false },
        ]);

        // Verify instruction data
        const data = instruction?.data;
        expect(data).toBeDefined();
        expect(data![0]).toBe(TokenInstruction.MintTo);
        expect(Buffer.from(data!.slice(1, 9)).readBigUInt64LE(0)).toBe(amount);
      });

      it("should handle large token amounts", async () => {
        const amount = BigInt("9007199254740991"); // Max safe integer
        const recipient = testPubkey;
        const mint = testPubkey;
        const mintAuthority = testPubkey;

        const mockSigner: SignerCallback = async (message_hash: string) => "mock_signature";
        const tx = await mintToTx(mint, recipient, amount, mintAuthority, mockSigner);

        const txInstructions = (tx as any).instructions as Instruction[];
        const instruction = txInstructions[0];
        expect(instruction).toBeDefined();

        const data = instruction?.data;
        expect(data).toBeDefined();
        expect(data![0]).toBe(TokenInstruction.MintTo);
        expect(Buffer.from(data!.slice(1, 9)).readBigUInt64LE(0)).toBe(amount);
      });

      it("should handle zero amount minting", async () => {
        const amount = BigInt(0);
        const recipient = testPubkey;
        const mint = testPubkey;
        const mintAuthority = testPubkey;

        const mockSigner: SignerCallback = async (message_hash: string) => "mock_signature";
        const tx = await mintToTx(mint, recipient, amount, mintAuthority, mockSigner);

        const txInstructions = (tx as any).instructions as Instruction[];
        const instruction = txInstructions[0];
        expect(instruction).toBeDefined();

        const data = instruction?.data;
        expect(data).toBeDefined();
        expect(data![0]).toBe(TokenInstruction.MintTo);
        expect(Buffer.from(data!.slice(1, 9)).readBigUInt64LE(0)).toBe(amount);
      });
    });
  });
});
