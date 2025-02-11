import type { Pubkey } from "@repo/arch-sdk";
import { readUInt64LE, writeBigUint64LE } from "../utils.js";

/**
 * Pool data structure that represents an AMM pool account.
 */
export interface Pool {
  /** First token mint */
  tokenA: Pubkey;
  /** Second token mint */
  tokenB: Pubkey;
  /** LP token mint */
  lpMint: Pubkey;
  /** Vault for token A */
  tokenAVault: Pubkey;
  /** Vault for token B */
  tokenBVault: Pubkey;
  /** Fee numerator */
  feeNumerator: number;
  /** Fee denominator */
  feeDenominator: number;
  /** Is `true` if this structure has been initialized */
  isInitialized: boolean;
}

/** Total length of the Pool data structure when serialized */
export const POOL_LEN = 165; // 32 * 5 + 2 * 2 + 1

/**
 * Deserializes pool data from a buffer
 * @param buffer Raw buffer data to deserialize
 * @returns Deserialized Pool object
 */
export function deserialize(buffer: Buffer): Pool {
  if (buffer.length !== POOL_LEN) {
    throw new Error(`Invalid buffer length: ${buffer.length}`);
  }

  // Extract pubkeys (32 bytes each)
  const tokenA = buffer.slice(0, 32);
  const tokenB = buffer.slice(32, 64);
  const lpMint = buffer.slice(64, 96);
  const tokenAVault = buffer.slice(96, 128);
  const tokenBVault = buffer.slice(128, 160);

  // Extract fee numerator and denominator (2 bytes each)
  const feeNumerator = buffer.readUInt16LE(160);
  const feeDenominator = buffer.readUInt16LE(162);

  // Extract is_initialized (1 byte)
  const isInitialized = buffer[164] === 1;
  if (buffer[164] !== 0 && buffer[164] !== 1) {
    throw new Error("Invalid is_initialized value");
  }

  return {
    tokenA,
    tokenB,
    lpMint,
    tokenAVault,
    tokenBVault,
    feeNumerator,
    feeDenominator,
    isInitialized,
  };
}

/**
 * Serializes a Pool object into a buffer
 * @param pool The Pool object to serialize
 * @returns Buffer containing the serialized data
 */
export function serialize(pool: Pool): Buffer {
  const buffer = Buffer.alloc(POOL_LEN);

  // Pack pubkeys
  buffer.set(pool.tokenA, 0);
  buffer.set(pool.tokenB, 32);
  buffer.set(pool.lpMint, 64);
  buffer.set(pool.tokenAVault, 96);
  buffer.set(pool.tokenBVault, 128);

  // Pack fee numerator and denominator
  buffer.writeUInt16LE(pool.feeNumerator, 160);
  buffer.writeUInt16LE(pool.feeDenominator, 162);

  // Pack is_initialized
  buffer[164] = pool.isInitialized ? 1 : 0;

  return buffer;
}
