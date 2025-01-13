import { Pubkey } from "@repo/arch-sdk";

/**
 * Serialize a public key to a Buffer, handling both Solana PublicKey and Arch Pubkey
 * @param pubkey - The public key to serialize
 * @returns Buffer containing the 32-byte public key
 */
export function serializePubkey(pubkey: Pubkey): Buffer {
  return Buffer.from(pubkey);
}

/**
 * Serialize an optional public key to a Buffer, handling both Solana PublicKey and Arch Pubkey
 * @param pubkey - The public key to serialize, or null
 * @returns Buffer containing the serialized optional public key
 */
export function serializeOptionPubkey(pubkey: Pubkey | null): Buffer {
  // Always allocate 36 bytes (4 for tag + 32 for key)
  const result = Buffer.alloc(36, 0);

  if (pubkey === null) {
    // None case - first 4 bytes are [0,0,0,0], rest are already 0
    result.set([0, 0, 0, 0], 0);
  } else {
    // Some case - first 4 bytes are [1,0,0,0], followed by pubkey
    result.set([1, 0, 0, 0], 0);
    result.set(serializePubkey(pubkey), 4);
  }

  return result;
}

/**
 * Helper to deserialize an optional public key from a buffer
 */
export function deserializeOptionPubkey(buffer: Buffer): Pubkey | null {
  const tag = buffer.readUInt32LE(0);
  if (tag === 0) {
    return null;
  } else if (tag === 1) {
    return buffer.slice(4, 36);
  }
  throw new Error(`Invalid option tag: ${tag}`);
}
