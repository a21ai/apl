import type { Pubkey } from "@repo/arch-sdk";
import { writeBigUint64LE } from "../utils.js";

export enum AmmInstruction {
  InitializePool = 0,
  AddLiquidity = 1,
  RemoveLiquidity = 2,
  Swap = 3,
}

// Instruction data interfaces
export interface InitializePoolData {
  instruction: AmmInstruction.InitializePool;
  feeNumerator: number;
  feeDenominator: number;
}

export interface AddLiquidityData {
  instruction: AmmInstruction.AddLiquidity;
  tokenAAmount: bigint;
  tokenBAmount: bigint;
  minLpAmount: bigint;
}

export interface RemoveLiquidityData {
  instruction: AmmInstruction.RemoveLiquidity;
  lpAmount: bigint;
  minTokenAAmount: bigint;
  minTokenBAmount: bigint;
}

export interface SwapData {
  instruction: AmmInstruction.Swap;
  amountIn: bigint;
  minAmountOut: bigint;
}

// Helper functions for instruction creation and serialization
export function serialize(instruction: AmmInstruction, data: any): Buffer {
  const buffers: Buffer[] = [];
  buffers.push(Buffer.from([instruction]));

  switch (instruction) {
    case AmmInstruction.InitializePool: {
      const { feeNumerator, feeDenominator } = data as InitializePoolData;
      const buf = Buffer.alloc(4);
      buf.writeUInt16LE(feeNumerator, 0);
      buf.writeUInt16LE(feeDenominator, 2);
      buffers.push(buf);
      break;
    }
    case AmmInstruction.AddLiquidity: {
      const { tokenAAmount, tokenBAmount, minLpAmount } = data as AddLiquidityData;
      const amountBuf = Buffer.alloc(24); // 8 bytes * 3
      writeBigUint64LE(amountBuf, tokenAAmount, 0);
      writeBigUint64LE(amountBuf, tokenBAmount, 8);
      writeBigUint64LE(amountBuf, minLpAmount, 16);
      buffers.push(amountBuf);
      break;
    }
    case AmmInstruction.RemoveLiquidity: {
      const { lpAmount, minTokenAAmount, minTokenBAmount } = data as RemoveLiquidityData;
      const amountBuf = Buffer.alloc(24); // 8 bytes * 3
      writeBigUint64LE(amountBuf, lpAmount, 0);
      writeBigUint64LE(amountBuf, minTokenAAmount, 8);
      writeBigUint64LE(amountBuf, minTokenBAmount, 16);
      buffers.push(amountBuf);
      break;
    }
    case AmmInstruction.Swap: {
      const { amountIn, minAmountOut } = data as SwapData;
      const amountBuf = Buffer.alloc(16); // 8 bytes * 2
      writeBigUint64LE(amountBuf, amountIn, 0);
      writeBigUint64LE(amountBuf, minAmountOut, 8);
      buffers.push(amountBuf);
      break;
    }
    default:
      throw new Error(`Unknown instruction: ${instruction}`);
  }

  return Buffer.concat(buffers);
}

export function deserialize(data: Uint8Array): {
  type: string;
  info: Record<string, string>;
} | null {
  if (data.length === 0) return null;

  const instructionType = data[0] as number;
  const remainingData = data.slice(1);

  const readU16LE = (data: Uint8Array, offset: number): number | null => {
    if (data.length < offset + 2) return null;
    const byte0 = data[offset];
    const byte1 = data[offset + 1];
    if (typeof byte0 === 'undefined' || typeof byte1 === 'undefined') return null;
    return byte0 + (byte1 << 8);
  };

  const readU64LE = (data: Uint8Array, offset: number): bigint | null => {
    if (data.length < offset + 8) return null;
    try {
      let value = BigInt(0);
      for (let i = 0; i < 8; i++) {
        const byte = data[offset + i];
        if (typeof byte === "undefined") return null;
        value += BigInt(byte) << BigInt(i * 8);
      }
      return value;
    } catch {
      return null;
    }
  };

  switch (instructionType) {
    case AmmInstruction.InitializePool: {
      const feeNumerator = readU16LE(remainingData, 0);
      const feeDenominator = readU16LE(remainingData, 2);
      if (feeNumerator === null || feeDenominator === null) return null;

      return {
        type: "InitializePool",
        info: {
          feeNumerator: feeNumerator.toString(),
          feeDenominator: feeDenominator.toString(),
        },
      };
    }
    case AmmInstruction.AddLiquidity: {
      const tokenAAmount = readU64LE(remainingData, 0);
      const tokenBAmount = readU64LE(remainingData, 8);
      const minLpAmount = readU64LE(remainingData, 16);
      if (tokenAAmount === null || tokenBAmount === null || minLpAmount === null) return null;

      return {
        type: "AddLiquidity",
        info: {
          tokenAAmount: tokenAAmount.toString(),
          tokenBAmount: tokenBAmount.toString(),
          minLpAmount: minLpAmount.toString(),
        },
      };
    }
    case AmmInstruction.RemoveLiquidity: {
      const lpAmount = readU64LE(remainingData, 0);
      const minTokenAAmount = readU64LE(remainingData, 8);
      const minTokenBAmount = readU64LE(remainingData, 16);
      if (lpAmount === null || minTokenAAmount === null || minTokenBAmount === null) return null;

      return {
        type: "RemoveLiquidity",
        info: {
          lpAmount: lpAmount.toString(),
          minTokenAAmount: minTokenAAmount.toString(),
          minTokenBAmount: minTokenBAmount.toString(),
        },
      };
    }
    case AmmInstruction.Swap: {
      const amountIn = readU64LE(remainingData, 0);
      const minAmountOut = readU64LE(remainingData, 8);
      if (amountIn === null || minAmountOut === null) return null;

      return {
        type: "Swap",
        info: {
          amountIn: amountIn.toString(),
          minAmountOut: minAmountOut.toString(),
        },
      };
    }
    default:
      return {
        type: "Unknown",
        info: {},
      };
  }
}
