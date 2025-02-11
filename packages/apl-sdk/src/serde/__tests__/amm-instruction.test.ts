import type { Pubkey } from "@repo/arch-sdk";
import { randomPrivateKeyBytes, pubSchnorr } from "@scure/btc-signer/utils";
import {
  AmmInstruction,
  serialize,
  deserialize,
  InitializePoolData,
  AddLiquidityData,
  RemoveLiquidityData,
  SwapData,
} from "../amm-instruction.js";

describe("amm instruction serialization", () => {
  // Create test pubkey using the same method as create-keypair.ts
  const testPriv = randomPrivateKeyBytes();
  const testPubkey = pubSchnorr(testPriv) as Pubkey;

  describe("serialize and deserialize", () => {
    it("should correctly round-trip InitializePool instruction", () => {
      const data: InitializePoolData = {
        instruction: AmmInstruction.InitializePool,
        feeNumerator: 25,
        feeDenominator: 10000,
      };
      const serialized = serialize(AmmInstruction.InitializePool, data);
      const deserialized = deserialize(serialized);

      expect(deserialized).not.toBeNull();
      expect(deserialized?.type).toBe("InitializePool");
      expect(deserialized?.info.feeNumerator).toBe("25");
      expect(deserialized?.info.feeDenominator).toBe("10000");
    });

    it("should correctly round-trip AddLiquidity instruction", () => {
      const data: AddLiquidityData = {
        instruction: AmmInstruction.AddLiquidity,
        tokenAAmount: BigInt(1000),
        tokenBAmount: BigInt(2000),
        minLpAmount: BigInt(500),
      };
      const serialized = serialize(AmmInstruction.AddLiquidity, data);
      const deserialized = deserialize(serialized);

      expect(deserialized).not.toBeNull();
      expect(deserialized?.type).toBe("AddLiquidity");
      expect(deserialized?.info.tokenAAmount).toBe("1000");
      expect(deserialized?.info.tokenBAmount).toBe("2000");
      expect(deserialized?.info.minLpAmount).toBe("500");
    });

    it("should correctly round-trip RemoveLiquidity instruction", () => {
      const data: RemoveLiquidityData = {
        instruction: AmmInstruction.RemoveLiquidity,
        lpAmount: BigInt(500),
        minTokenAAmount: BigInt(900),
        minTokenBAmount: BigInt(1800),
      };
      const serialized = serialize(AmmInstruction.RemoveLiquidity, data);
      const deserialized = deserialize(serialized);

      expect(deserialized).not.toBeNull();
      expect(deserialized?.type).toBe("RemoveLiquidity");
      expect(deserialized?.info.lpAmount).toBe("500");
      expect(deserialized?.info.minTokenAAmount).toBe("900");
      expect(deserialized?.info.minTokenBAmount).toBe("1800");
    });

    it("should correctly round-trip Swap instruction", () => {
      const data: SwapData = {
        instruction: AmmInstruction.Swap,
        amountIn: BigInt(1000),
        minAmountOut: BigInt(900),
      };
      const serialized = serialize(AmmInstruction.Swap, data);
      const deserialized = deserialize(serialized);

      expect(deserialized).not.toBeNull();
      expect(deserialized?.type).toBe("Swap");
      expect(deserialized?.info.amountIn).toBe("1000");
      expect(deserialized?.info.minAmountOut).toBe("900");
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
});
