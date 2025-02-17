import { Pubkey } from "@repo/arch-sdk";
import { randomPrivateKeyBytes, pubSchnorr } from "@scure/btc-signer/utils";
import {
  TokenInstruction,
  AuthorityType,
  serialize,
  serializeU64LE,
  deserialize,
  InitializeMintData,
  TransferData,
  SetAuthorityData,
  InitializeMultisigData,
  TransferCheckedData,
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

  describe("serialize and deserialize", () => {
    it("should correctly round-trip InitializeMint instruction", () => {
      const data: InitializeMintData = {
        instruction: TokenInstruction.InitializeMint,
        decimals: 9,
        mintAuthority: testPubkey,
        freezeAuthority: null,
      };
      const serialized = serialize(TokenInstruction.InitializeMint, data);
      const deserialized = deserialize(serialized);

      expect(deserialized).not.toBeNull();
      expect(deserialized?.type).toBe("InitializeMint");
      expect(deserialized?.info.decimals).toBe("9");
    });

    it("should correctly round-trip Transfer instruction", () => {
      const data: TransferData = {
        instruction: TokenInstruction.Transfer,
        amount: BigInt(1000),
      };
      const serialized = serialize(TokenInstruction.Transfer, data);
      const deserialized = deserialize(serialized);

      expect(deserialized).not.toBeNull();
      expect(deserialized?.type).toBe("Transfer");
      expect(deserialized?.info.amount).toBe("1000");
    });

    it("should correctly round-trip SetAuthority instruction", () => {
      const data: SetAuthorityData = {
        instruction: TokenInstruction.SetAuthority,
        authorityType: AuthorityType.MintTokens,
        newAuthority: testPubkey,
      };
      const serialized = serialize(TokenInstruction.SetAuthority, data);
      const deserialized = deserialize(serialized);

      expect(deserialized).not.toBeNull();
      expect(deserialized?.type).toBe("SetAuthority");
      expect(deserialized?.info.authorityType).toBe("0"); // MintTokens = 0
    });

    it("should correctly round-trip InitializeMultisig instruction", () => {
      const data: InitializeMultisigData = {
        instruction: TokenInstruction.InitializeMultisig,
        m: 2,
      };
      const serialized = serialize(TokenInstruction.InitializeMultisig, data);
      const deserialized = deserialize(serialized);

      expect(deserialized).not.toBeNull();
      expect(deserialized?.type).toBe("InitializeMultisig");
      expect(deserialized?.info.m).toBe("2");
    });

    it("should correctly round-trip TransferChecked instruction", () => {
      const data: TransferCheckedData = {
        instruction: TokenInstruction.TransferChecked,
        amount: BigInt(1000),
        decimals: 9,
      };
      const serialized = serialize(TokenInstruction.TransferChecked, data);
      const deserialized = deserialize(serialized);

      expect(deserialized).not.toBeNull();
      expect(deserialized?.type).toBe("TransferChecked");
      expect(deserialized?.info.amount).toBe("1000");
    });

    it("should handle unknown instruction type", () => {
      const unknownInstruction = 99;
      const serialized = Buffer.from([unknownInstruction]);
      const deserialized = deserialize(serialized);

      expect(deserialized).not.toBeNull();
      expect(deserialized?.type).toBe("Unknown");
      expect(Object.keys(deserialized?.info || {}).length).toBe(0);
    });

    it("should handle empty buffer", () => {
      const deserialized = deserialize(new Uint8Array());
      expect(deserialized).toBeNull();
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
      expect(Buffer.from(result.slice(2, 34))).toEqual(Buffer.from(testPubkey)); // mint authority
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
      expect(Buffer.from(result.slice(6, 38))).toEqual(Buffer.from(testPubkey));
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

      it(`should deserialize ${TokenInstruction[instruction]} instruction`, () => {
        const serialized = serialize(instruction, { instruction });
        const deserialized = deserialize(serialized);
        expect(deserialized).not.toBeNull();
        expect(deserialized?.type).toBe(TokenInstruction[instruction]);
        expect(Object.keys(deserialized?.info || {}).length).toBe(0);
      });
    });
  });

  describe("additional instruction coverage", () => {
    describe("deserialize", () => {
      it("should correctly deserialize Approve instruction", () => {
        const amount = BigInt(1000);
        const data = Buffer.alloc(9);
        data[0] = TokenInstruction.Approve;
        data.writeBigUInt64LE(amount, 1);
        const deserialized = deserialize(data);

        expect(deserialized).not.toBeNull();
        expect(deserialized?.type).toBe("Approve");
        expect(deserialized?.info.amount).toBe("1000");
      });

      it("should correctly deserialize MintTo instruction", () => {
        const amount = BigInt(2000);
        const data = Buffer.alloc(9);
        data[0] = TokenInstruction.MintTo;
        data.writeBigUInt64LE(amount, 1);
        const deserialized = deserialize(data);

        expect(deserialized).not.toBeNull();
        expect(deserialized?.type).toBe("MintTo");
        expect(deserialized?.info.amount).toBe("2000");
      });

      it("should correctly deserialize Burn instruction", () => {
        const amount = BigInt(3000);
        const data = Buffer.alloc(9);
        data[0] = TokenInstruction.Burn;
        data.writeBigUInt64LE(amount, 1);
        const deserialized = deserialize(data);

        expect(deserialized).not.toBeNull();
        expect(deserialized?.type).toBe("Burn");
        expect(deserialized?.info.amount).toBe("3000");
      });

      it("should handle insufficient data length for amount", () => {
        const data = Buffer.from([TokenInstruction.Transfer, 1, 2, 3]); // Not enough bytes for u64
        const deserialized = deserialize(data);
        expect(deserialized).toBeNull();
      });

      it("should handle insufficient data length for decimals", () => {
        const data = Buffer.from([TokenInstruction.InitializeMint]); // No decimals byte
        const deserialized = deserialize(data);
        expect(deserialized).toBeNull();
      });

      it("should handle invalid u64 data", () => {
        // Create a buffer with invalid bytes that would cause BigInt conversion to fail
        const data = Buffer.from([
          TokenInstruction.Transfer,
          0xff, // Create invalid data by making the buffer too short
        ]);
        const deserialized = deserialize(data);
        expect(deserialized).toBeNull();
      });
    });

    describe("serialize additional instructions", () => {
      const testPriv = randomPrivateKeyBytes();
      const testPubkey = pubSchnorr(testPriv) as Pubkey;

      it("should serialize InitializeAccount2 instruction", () => {
        const result = serialize(TokenInstruction.InitializeAccount2, {
          owner: testPubkey,
        });
        expect(result[0]).toBe(TokenInstruction.InitializeAccount2);
        expect(Buffer.from(result.slice(1, 33))).toEqual(
          Buffer.from(testPubkey)
        );
      });

      it("should serialize InitializeAccount3 instruction", () => {
        const result = serialize(TokenInstruction.InitializeAccount3, {
          owner: testPubkey,
        });
        expect(result[0]).toBe(TokenInstruction.InitializeAccount3);
        expect(Buffer.from(result.slice(1, 33))).toEqual(
          Buffer.from(testPubkey)
        );
      });

      it("should serialize UiAmountToAmount instruction", () => {
        const uiAmount = "1.5";
        const result = serialize(TokenInstruction.UiAmountToAmount, {
          uiAmount,
        });
        expect(result[0]).toBe(TokenInstruction.UiAmountToAmount);
        expect(Buffer.from(result.slice(1)).toString()).toBe(uiAmount);
      });

      it("should serialize InitializeMint2 instruction", () => {
        const data = {
          decimals: 9,
          mintAuthority: testPubkey,
          freezeAuthority: testPubkey,
        };
        const result = serialize(TokenInstruction.InitializeMint2, data);
        expect(result[0]).toBe(TokenInstruction.InitializeMint2);
        expect(result[1]).toBe(9); // decimals
        expect(Buffer.from(result.slice(2, 34))).toEqual(
          Buffer.from(testPubkey)
        ); // mint authority
        // For Some(freezeAuthority), we expect a 4-byte Some tag followed by the pubkey
        const someTag = Buffer.from([1, 0, 0, 0]); // Some tag in Rust
        expect(Buffer.from(result.slice(34, 38))).toEqual(someTag);
        expect(Buffer.from(result.slice(38, 70))).toEqual(
          Buffer.from(testPubkey)
        ); // freeze authority
      });
    });
  });
});
