import { Pubkey } from "@repo/arch-sdk";
import { serializePubkey, serializeOptionPubkey } from "./pubkey.js";
import { writeBigUint64LE } from "../utils.js";

// Instruction data layouts
export interface InitializeMintData {
  instruction: TokenInstruction.InitializeMint;
  decimals: number;
  mintAuthority: Pubkey;
  freezeAuthority: Pubkey | null;
}

export interface TransferData {
  instruction: TokenInstruction.Transfer;
  amount: bigint;
}

export interface ApproveData {
  instruction: TokenInstruction.Approve;
  amount: bigint;
}

export interface MintToData {
  instruction: TokenInstruction.MintTo;
  amount: bigint;
}

export interface BurnData {
  instruction: TokenInstruction.Burn;
  amount: bigint;
}

// Instruction data interfaces
export interface SetAuthorityData {
  instruction: TokenInstruction.SetAuthority;
  authorityType: AuthorityType;
  newAuthority: Pubkey | null;
}

export interface InitializeAccountData {
  instruction: TokenInstruction.InitializeAccount;
}

export interface CloseAccountData {
  instruction: TokenInstruction.CloseAccount;
}

export interface FreezeAccountData {
  instruction: TokenInstruction.FreezeAccount;
}

export interface ThawAccountData {
  instruction: TokenInstruction.ThawAccount;
}

export interface TransferCheckedData {
  instruction: TokenInstruction.TransferChecked;
  amount: bigint;
  decimals: number;
}

export interface ApproveCheckedData {
  instruction: TokenInstruction.ApproveChecked;
  amount: bigint;
  decimals: number;
}

export interface MintToCheckedData {
  instruction: TokenInstruction.MintToChecked;
  amount: bigint;
  decimals: number;
}

export interface BurnCheckedData {
  instruction: TokenInstruction.BurnChecked;
  amount: bigint;
  decimals: number;
}

export interface InitializeMultisigData {
  instruction: TokenInstruction.InitializeMultisig;
  m: number;
}

// Instruction Types (matching Rust enum)
// Verified against Rust token program's instruction.rs
export enum TokenInstruction {
  InitializeMint = 0, // [0, decimals(1), mint_authority(32), freeze_authority_option(1 + 32)]
  InitializeAccount = 1, // [1]
  InitializeMultisig = 2, // [2, m(1)]
  Transfer = 3, // [3, amount(8)]
  Approve = 4, // [4, amount(8)]
  Revoke = 5, // [5]
  SetAuthority = 6, // [6, authority_type(1), new_authority_option(1 + 32)]
  MintTo = 7, // [7, amount(8)]
  Burn = 8, // [8, amount(8)]
  CloseAccount = 9, // [9]
  FreezeAccount = 10, // [10]
  ThawAccount = 11, // [11]
  TransferChecked = 12, // [12, amount(8), decimals(1)]
  ApproveChecked = 13, // [13, amount(8), decimals(1)]
  MintToChecked = 14, // [14, amount(8), decimals(1)]
  BurnChecked = 15, // [15, amount(8), decimals(1)]
  InitializeAccount2 = 16, // [16, owner(32)]
  InitializeAccount3 = 17, // [17, owner(32)]
  InitializeMint2 = 18, // [18, decimals(1), mint_authority(32), freeze_authority_option(1 + 32)]
  GetAccountDataSize = 19, // [19]
  InitializeImmutableOwner = 20, // [20]
  AmountToUiAmount = 21, // [21, amount(8)]
  UiAmountToAmount = 22, // [22, ui_amount_string(len + string_bytes)]
}

// Authority Types (matching Rust enum)
export enum AuthorityType {
  MintTokens = 0,
  FreezeAccount = 1,
  AccountOwner = 2,
  CloseAccount = 3,
}

// Account State (matching Rust enum)
export enum AccountState {
  Uninitialized = 0,
  Initialized = 1,
  Frozen = 2,
}
// Helper functions for instruction creation and serialization
// Serialization utilities that match Rust token program's byte-level patterns
export function serializeU64LE(value: number | bigint): Buffer {
  const buf = Buffer.alloc(8);
  // Convert to BigInt to handle both number and bigint inputs
  const bigIntValue = BigInt(value);
  // Write as little-endian u64, matching Rust's byte pattern
  for (let i = 0; i < 8; i++) {
    buf[i] = Number((bigIntValue >> BigInt(i * 8)) & BigInt(0xff));
  }
  return buf;
}

/// to match Rust's exact byte pattern (1 byte tag + optional 32 bytes)

// Main serialization function that matches Rust's pack() implementation
export interface ParsedTokenInstruction {
  type: string;
  info: Record<string, string | number>;
}

export function deserialize(data: Uint8Array): ParsedTokenInstruction | null {
  if (data.length === 0) return null;

  // First byte must exist since we checked length
  const instructionType = data[0] as number;
  const remainingData = data.slice(1);

  // Helper function to safely read a u8 value
  const readU8 = (data: Uint8Array, offset: number): number | null => {
    if (data.length <= offset) return null;
    const value = data[offset];
    return typeof value === "number" ? value : null;
  };

  // Helper function to safely read a u64 value
  const readU64 = (data: Uint8Array, offset: number): bigint | null => {
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
    case TokenInstruction.Transfer:
    case TokenInstruction.TransferChecked: {
      const amount = readU64(remainingData, 0);
      if (amount === null) return null;

      return {
        type:
          instructionType === TokenInstruction.Transfer
            ? "Transfer"
            : "TransferChecked",
        info: {
          amount: amount.toString(),
        },
      };
    }

    case TokenInstruction.MintTo:
    case TokenInstruction.MintToChecked: {
      const amount = readU64(remainingData, 0);
      if (amount === null) return null;

      return {
        type:
          instructionType === TokenInstruction.MintTo
            ? "MintTo"
            : "MintToChecked",
        info: {
          amount: amount.toString(),
        },
      };
    }

    case TokenInstruction.Burn:
    case TokenInstruction.BurnChecked: {
      const amount = readU64(remainingData, 0);
      if (amount === null) return null;

      return {
        type:
          instructionType === TokenInstruction.Burn ? "Burn" : "BurnChecked",
        info: {
          amount: amount.toString(),
        },
      };
    }

    case TokenInstruction.InitializeMint:
    case TokenInstruction.InitializeMint2: {
      const decimals = readU8(remainingData, 0);
      if (decimals === null) return null;

      return {
        type:
          instructionType === TokenInstruction.InitializeMint
            ? "InitializeMint"
            : "InitializeMint2",
        info: {
          decimals: decimals.toString(),
        },
      };
    }

    case TokenInstruction.InitializeMultisig: {
      const m = readU8(remainingData, 0);
      if (m === null) return null;

      return {
        type: "InitializeMultisig",
        info: {
          m: m.toString(),
        },
      };
    }

    case TokenInstruction.SetAuthority: {
      const authorityType = readU8(remainingData, 0);
      if (authorityType === null) return null;

      return {
        type: "SetAuthority",
        info: {
          authorityType: authorityType.toString(),
        },
      };
    }

    default: {
      // Only attempt to get instruction name if it's a valid enum value
      const validInstruction =
        Object.values(TokenInstruction).includes(instructionType);
      const instructionName = validInstruction
        ? TokenInstruction[instructionType as TokenInstruction]
        : null;

      return {
        type: instructionName || "Unknown",
        info: {},
      };
    }
  }
}

export function serialize(instruction: TokenInstruction, data: any): Buffer {
  const buffers: Buffer[] = [];

  // Add instruction tag
  buffers.push(Buffer.from([instruction]));

  // Add instruction-specific data
  switch (instruction) {
    case TokenInstruction.InitializeMultisig: {
      const { m } = data;
      buffers.push(Buffer.from([m]));
      break;
    }
    case TokenInstruction.InitializeMint:
    case TokenInstruction.InitializeMint2: {
      const { decimals, mintAuthority, freezeAuthority } = data;
      const mintBuf = Buffer.alloc(69, 0);
      mintBuf.writeUInt8(decimals, 0);
      mintBuf.set(serializePubkey(mintAuthority), 1);
      mintBuf.set(serializeOptionPubkey(freezeAuthority), 33);
      buffers.push(mintBuf);
      break;
    }
    case TokenInstruction.Transfer:
    case TokenInstruction.Approve:
    case TokenInstruction.MintTo:
    case TokenInstruction.Burn:
    case TokenInstruction.AmountToUiAmount: {
      const { amount } = data;
      // Ensure exact byte pattern: [tag, amount(8 bytes LE)]
      const amountBuf = Buffer.alloc(8);
      writeBigUint64LE(amountBuf, BigInt(amount), 0);
      buffers.push(amountBuf);
      break;
    }
    case TokenInstruction.TransferChecked:
    case TokenInstruction.ApproveChecked:
    case TokenInstruction.MintToChecked:
    case TokenInstruction.BurnChecked: {
      const { amount, decimals } = data;
      // Ensure exact byte pattern: [tag, amount(8 bytes LE), decimals(1)]
      const amountBuf = Buffer.alloc(8);
      writeBigUint64LE(amountBuf, BigInt(amount), 0);
      buffers.push(amountBuf);
      buffers.push(Buffer.from([decimals]));
      break;
    }
    case TokenInstruction.SetAuthority: {
      const { authorityType, newAuthority } = data;
      buffers.push(Buffer.from([authorityType]));
      buffers.push(serializeOptionPubkey(newAuthority));
      break;
    }
    case TokenInstruction.InitializeAccount2:
    case TokenInstruction.InitializeAccount3: {
      const { owner } = data;
      buffers.push(serializePubkey(owner));
      break;
    }
    case TokenInstruction.UiAmountToAmount: {
      const { uiAmount } = data;
      // Convert string to UTF-8 bytes without length prefix
      buffers.push(Buffer.from(uiAmount, "utf8"));
      break;
    }
    // Simple instructions with just a tag
    case TokenInstruction.InitializeAccount:
    case TokenInstruction.Revoke:
    case TokenInstruction.CloseAccount:
    case TokenInstruction.FreezeAccount:
    case TokenInstruction.ThawAccount:
    case TokenInstruction.GetAccountDataSize:
    case TokenInstruction.InitializeImmutableOwner:
      break;
    default:
      throw new Error(`Unknown instruction: ${instruction}`);
  }

  return Buffer.concat(buffers);
}
