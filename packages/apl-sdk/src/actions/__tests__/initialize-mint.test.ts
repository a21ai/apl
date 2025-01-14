import { Pubkey, UtxoMetaData, RuntimeTransaction, Instruction } from "@repo/arch-sdk";
import { randomPrivateKeyBytes, pubSchnorr } from "@scure/btc-signer/utils";
import { initializeMintTx } from "../initialize-mint.js";
import { TokenInstruction } from "../../serde/token-instruction.js";
import { TOKEN_PROGRAM_ID } from "../../constants.js";
import { SignerCallback, Keypair } from "../../utils.js";

describe("initialize-mint action", () => {
  // Create test pubkeys using the same method as create-keypair.ts
  const testPriv = randomPrivateKeyBytes();
  const testPubkey = pubSchnorr(testPriv) as Pubkey;

  describe("initializeMintTx", () => {
    describe("with valid parameters", () => {
      it("should create initialize mint transaction with all instructions", async () => {
        const decimals = 9;
        const mintAuthority = testPubkey;
        const freezeAuthority = testPubkey;
        const mintKeypair = { publicKey: testPubkey };
        const utxo = { txid: "0".repeat(64), vout: 0 };
        
        const mockSigner: SignerCallback = async (message_hash: string) => "mock_signature";
        const tx = await initializeMintTx(
          mintKeypair as any,
          utxo,
          decimals,
          mintAuthority,
          freezeAuthority,
          mockSigner
        );

        // Should have 4 instructions: account, write, assign, initialize
        const txInstructions = (tx as any).instructions as Instruction[];
        expect(txInstructions.length).toBe(4);
        
        // Verify initialize mint instruction
        const initMintInstr = txInstructions[3];
        expect(initMintInstr).toBeDefined();
        expect(initMintInstr?.program_id).toEqual(TOKEN_PROGRAM_ID);
        expect(initMintInstr?.accounts).toEqual([
          { pubkey: mintKeypair.publicKey, is_signer: true, is_writable: true },
        ]);

        // Verify instruction data
        const data = initMintInstr?.data;
        expect(data).toBeDefined();
        expect(data![0]).toBe(TokenInstruction.InitializeMint2);
        expect(data![1]).toBe(decimals);
        expect(Buffer.from(data!.slice(2, 34))).toEqual(Buffer.from(mintAuthority));
        expect(Buffer.from(data!.slice(38, 70))).toEqual(Buffer.from(freezeAuthority));
      });

      it("should handle null freeze authority", async () => {
        const decimals = 9;
        const mintAuthority = testPubkey;
        const freezeAuthority = null;
        const mintKeypair = { publicKey: testPubkey };
        const utxo = { txid: "0".repeat(64), vout: 0 };
        
        const mockSigner: SignerCallback = async (message_hash: string) => "mock_signature";
        const tx = await initializeMintTx(
          mintKeypair as any,
          utxo,
          decimals,
          mintAuthority,
          freezeAuthority,
          mockSigner
        );

        const txInstructions = (tx as any).instructions as Instruction[];
        const initMintInstr = txInstructions[3];
        expect(initMintInstr).toBeDefined();

        const data = initMintInstr?.data;
        expect(data).toBeDefined();
        // Verify freeze authority is null
        expect(Buffer.from(data!.slice(34, 38))).toEqual(Buffer.from([0, 0, 0, 0])); // None tag
        expect(Buffer.from(data!.slice(38, 70))).toEqual(Buffer.alloc(32, 0)); // Zero padding
      });

      it("should handle different decimal values", async () => {
        const decimals = 0; // Test with 0 decimals
        const mintAuthority = testPubkey;
        const freezeAuthority = testPubkey;
        const mintKeypair = { publicKey: testPubkey };
        const utxo = { txid: "0".repeat(64), vout: 0 };
        
        const mockSigner: SignerCallback = async (message_hash: string) => "mock_signature";
        const tx = await initializeMintTx(
          mintKeypair as any,
          utxo,
          decimals,
          mintAuthority,
          freezeAuthority,
          mockSigner
        );

        const txInstructions = (tx as any).instructions as Instruction[];
        const initMintInstr = txInstructions[3];
        expect(initMintInstr).toBeDefined();

        const data = initMintInstr?.data;
        expect(data).toBeDefined();
        expect(data![1]).toBe(0); // Verify decimals is 0
      });
    });
  });
});
