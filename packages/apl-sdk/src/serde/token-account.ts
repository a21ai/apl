import { deserializeOptionPubkey, serializeOptionPubkey } from "./pubkey.js";
import { readUInt64LE, writeBigUint64LE } from "../utils.js";

/**
 * Token account data structure that represents a token account.
 * Matches the Rust Account struct's 164-byte layout exactly.
 */
export interface TokenAccount {
  /** The mint associated with this account */
  mint: Uint8Array;
  /** The owner of this account */
  owner: Uint8Array;
  /** The amount of tokens this account holds */
  amount: bigint;
  /** Optional delegate authority to transfer tokens */
  delegate: Uint8Array | null;
  /** The account's state */
  state: number;
  /** The amount delegated */
  delegated_amount: bigint;
  /** Optional authority to close the account */
  close_authority: Uint8Array | null;
}

/** Account state enumeration matching Rust's AccountState */
export enum AccountState {
  Uninitialized = 0,
  Initialized = 1,
  Frozen = 2,
}

/** Total length of the Account data structure when serialized */
export const ACCOUNT_LEN = 164;

/**
 * Deserializes account data from a buffer
 * @param buffer Raw buffer data to deserialize
 * @returns Deserialized TokenAccount object
 */
export function deserialize(buffer: Buffer): TokenAccount {
  if (buffer.length !== ACCOUNT_LEN) {
    throw new Error(`Invalid buffer length: ${buffer.length}`);
  }

  // Extract mint (32 bytes)
  if (buffer.length < 32) {
    throw new Error("Buffer too short for mint");
  }
  const mint = buffer.slice(0, 32);

  // Extract owner (32 bytes)
  if (buffer.length < 64) {
    throw new Error("Buffer too short for owner");
  }
  const owner = buffer.slice(32, 64);

  // Extract amount (8 bytes)
  if (buffer.length < 72) {
    throw new Error("Buffer too short for amount");
  }
  const amount = readUInt64LE(buffer, 64);

  // Extract delegate (36 bytes: 4 byte tag + 32 byte pubkey)
  if (buffer.length < 108) {
    throw new Error("Buffer too short for delegate");
  }
  const delegate = deserializeOptionPubkey(buffer.slice(72, 108));

  // Extract state (1 byte)
  if (buffer.length <= 108) {
    throw new Error("Buffer too short for state");
  }
  const stateValue = buffer[108] as number;
  if (stateValue === undefined || stateValue > AccountState.Frozen) {
    throw new Error("Invalid account state");
  }

  // Extract delegated amount (8 bytes)
  if (buffer.length < 117) {
    throw new Error("Buffer too short for delegated amount");
  }
  const delegated_amount = readUInt64LE(buffer, 109);

  // Extract close authority (36 bytes: 4 byte tag + 32 byte pubkey)
  if (buffer.length < 153) {
    throw new Error("Buffer too short for close authority");
  }
  const close_authority = deserializeOptionPubkey(buffer.slice(117, 153));

  return {
    mint,
    owner,
    amount,
    delegate,
    state: stateValue,
    delegated_amount,
    close_authority,
  };
}

/**
 * Serializes a TokenAccount object into a buffer
 * @param account The TokenAccount object to serialize
 * @returns Buffer containing the serialized data
 */
export function serialize(account: TokenAccount): Buffer {
  const buffer = Buffer.alloc(ACCOUNT_LEN);

  // Pack mint (32 bytes)
  buffer.set(account.mint, 0);

  // Pack owner (32 bytes)
  buffer.set(account.owner, 32);

  // Pack amount (8 bytes)
  writeBigUint64LE(buffer, account.amount, 64);

  // Pack delegate (36 bytes: 4 byte tag + 32 byte pubkey)
  buffer.set(serializeOptionPubkey(account.delegate), 72);

  // Pack state (1 byte)
  buffer[108] = account.state;

  // Pack delegated amount (8 bytes)
  writeBigUint64LE(buffer, account.delegated_amount, 109);

  // Pack close authority (36 bytes: 4 byte tag + 32 byte pubkey)
  buffer.set(serializeOptionPubkey(account.close_authority), 117);

  return buffer;
}
