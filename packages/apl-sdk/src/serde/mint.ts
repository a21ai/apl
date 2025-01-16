import { Pubkey } from "@repo/arch-sdk";
import { serializeOptionPubkey, deserializeOptionPubkey } from "./pubkey.js";
import { readUInt64LE, writeBigUint64LE } from "../utils.js";

/**
 * Mint data structure that represents a token mint account.
 */
export interface Mint {
  /**
   * Optional authority used to mint new tokens. The mint authority may only
   * be provided during mint creation. If no mint authority is present
   * then the mint has a fixed supply and no further tokens may be minted.
   */
  mint_authority: Pubkey | null;

  /** Total supply of tokens */
  supply: bigint;

  /** Number of base 10 digits to the right of the decimal place */
  decimals: number;

  /** Is `true` if this structure has been initialized */
  is_initialized: boolean;

  /** Optional authority to freeze token accounts */
  freeze_authority: Pubkey | null;
}

/** Total length of the Mint data structure when serialized */
export const MINT_LEN = 82;

/**
 * Deserializes mint data from a buffer
 * @param buffer Raw buffer data to deserialize
 * @returns Deserialized Mint object
 */
export function deserialize(buffer: Buffer): Mint {
  if (buffer.length !== MINT_LEN) {
    throw new Error(`Invalid buffer length: ${buffer.length}`);
  }

  // Extract mint authority (36 bytes: 4 byte tag + 32 byte pubkey)
  const mint_authority = deserializeOptionPubkey(buffer.slice(0, 36));

  // Extract supply (8 bytes)
  const supply = readUInt64LE(buffer, 36);

  // Extract decimals (1 byte)
  const decimals = buffer.readUInt8(44);

  // Extract is_initialized (1 byte)
  const is_initialized = buffer[45] === 1;
  if (buffer[45] !== 0 && buffer[45] !== 1) {
    throw new Error("Invalid is_initialized value");
  }

  // Extract freeze authority (36 bytes: 4 byte tag + 32 byte pubkey)
  const freeze_authority = deserializeOptionPubkey(buffer.slice(46, 82));

  return {
    mint_authority,
    supply,
    decimals,
    is_initialized,
    freeze_authority,
  };
}

/**
 * Serializes a Mint object into a buffer
 * @param mint The Mint object to serialize
 * @returns Buffer containing the serialized data
 */
export function serialize(mint: Mint): Buffer {
  const buffer = Buffer.alloc(MINT_LEN);

  // Pack mint authority
  buffer.set(serializeOptionPubkey(mint.mint_authority), 0);

  // Pack supply
  writeBigUint64LE(buffer, mint.supply, 36);

  // Pack decimals
  buffer.writeUInt8(mint.decimals, 44);

  // Pack is_initialized
  buffer[45] = mint.is_initialized ? 1 : 0;

  // Pack freeze authority
  buffer.set(serializeOptionPubkey(mint.freeze_authority), 46);

  return buffer;
}
