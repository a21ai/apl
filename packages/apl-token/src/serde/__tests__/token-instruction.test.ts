import { Pubkey } from "@repo/arch-sdk";
import { randomPrivateKeyBytes, pubSchnorr } from "@scure/btc-signer/utils";
import {
  TokenInstruction,
  AuthorityType,
  serialize,
  serializeU64LE,
  InitializeMintData,
  TransferData,
  ApproveData,
  MintToData,
  BurnData,
  SetAuthorityData,
  InitializeMultisigData,
  TransferCheckedData,
  ApproveCheckedData,
  MintToCheckedData,
  BurnCheckedData,
} from "../token-instruction.js";

describe("token instruction serialization", () => {
  // Create test pubkey using the same method as create-keypair.ts
  const testPriv = randomPrivateKeyBytes();
  const testPubkey = pubSchnorr(testPriv) as Pubkey;

  describe("serializeU64LE", () => {
    it("should correctly serialize number to u64 LE", () => {
      const result = serializeU64LE(1000);
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBe(8);
      expect(result.readBigUInt64LE(0)).toBe(BigInt(1000));
    });

    it("should correctly serialize bigint to u64 LE", () => {
      const result = serializeU64LE(BigInt("9007199254740991")); // Max safe integer
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBe(8);
      expect(result.readBigUInt64LE(0)).toBe(BigInt("9007199254740991"));
    });
  });

  describe("serialize", () => {
    it("should serialize InitializeMint instruction", () => {
      const data: InitializeMintData = {
        instruction: TokenInstruction.InitializeMint,
        decimals: 9,
        mintAuthority: testPubkey,
        freezeAuthority: null,
      };
      const result = serialize(TokenInstruction.InitializeMint, data);

      expect(result[0]).toBe(TokenInstruction.InitializeMint);
      expect(result[1]).toBe(9); // decimals
      expect(result.slice(2, 34)).toEqual(Buffer.from(testPubkey)); // mint authority
      expect(result.slice(34, 38)).toEqual(Buffer.from([0, 0, 0, 0])); // None tag for freeze authority
    });

    it("should serialize Transfer instruction", () => {
      const data: TransferData = {
        instruction: TokenInstruction.Transfer,
        amount: BigInt(1000),
      };
      const result = serialize(TokenInstruction.Transfer, data);

      expect(result[0]).toBe(TokenInstruction.Transfer);
      expect(result.slice(1).readBigUInt64LE(0)).toBe(BigInt(1000));
    });

    it("should serialize SetAuthority instruction", () => {
      const data: SetAuthorityData = {
        instruction: TokenInstruction.SetAuthority,
        authorityType: AuthorityType.MintTokens,
        newAuthority: testPubkey,
      };
      const result = serialize(TokenInstruction.SetAuthority, data);

      expect(result[0]).toBe(TokenInstruction.SetAuthority);
      expect(result[1]).toBe(AuthorityType.MintTokens);
      expect(result.slice(2, 6)).toEqual(Buffer.from([1, 0, 0, 0])); // Some tag
      expect(result.slice(6, 38)).toEqual(Buffer.from(testPubkey));
    });

    it("should serialize InitializeMultisig instruction", () => {
      const data: InitializeMultisigData = {
        instruction: TokenInstruction.InitializeMultisig,
        m: 2,
      };
      const result = serialize(TokenInstruction.InitializeMultisig, data);

      expect(result[0]).toBe(TokenInstruction.InitializeMultisig);
      expect(result[1]).toBe(2);
    });

    it("should serialize TransferChecked instruction", () => {
      const data: TransferCheckedData = {
        instruction: TokenInstruction.TransferChecked,
        amount: BigInt(1000),
        decimals: 9,
      };
      const result = serialize(TokenInstruction.TransferChecked, data);

      expect(result[0]).toBe(TokenInstruction.TransferChecked);
      expect(result.slice(1, 9).readBigUInt64LE(0)).toBe(BigInt(1000));
      expect(result[9]).toBe(9);
    });

    it("should throw error for unknown instruction", () => {
      expect(() => serialize(99 as TokenInstruction, {})).toThrow(
        "Unknown instruction: 99"
      );
    });
  });

  // Test simple instructions that only need a tag
  describe("simple instructions", () => {
    const simpleInstructions = [
      TokenInstruction.InitializeAccount,
      TokenInstruction.Revoke,
      TokenInstruction.CloseAccount,
      TokenInstruction.FreezeAccount,
      TokenInstruction.ThawAccount,
      TokenInstruction.GetAccountDataSize,
      TokenInstruction.InitializeImmutableOwner,
    ];

    simpleInstructions.forEach((instruction) => {
      it(`should serialize ${TokenInstruction[instruction]} instruction`, () => {
        const result = serialize(instruction, { instruction });
        expect(result.length).toBe(1);
        expect(result[0]).toBe(instruction);
      });
    });
  });
});
