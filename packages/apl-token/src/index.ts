import { PublicKey } from "@solana/web3.js";
import {
  Pubkey,
  RuntimeTransaction,
  Message,
  Instruction,
  AccountMeta,
  UtxoMetaData,
  UtxoMetaUtil,
  MessageUtil,
} from "@repo/arch-sdk";
import { Buffer } from "buffer";
import { sha256 } from "@noble/hashes/sha2";
import { randomPrivateKeyBytes } from "@scure/btc-signer/utils";
import { pubSchnorr } from "@scure/btc-signer/utils";

/**
 * Callback function for signing transactions.
 * This flexible interface allows different signing implementations:
 * - Node.js environment with private key signing
 * - Web3 wallets (Unisat, etc.) that need custom signing logic
 * - Any other custom signing implementation
 *
 * The callback is responsible for:
 * 1. Populating transaction.signatures with appropriate signatures
 * 2. Optionally modifying transaction.message.signers if needed
 * 3. Returning the signed transaction
 *
 * @param message_hash - The message hash to sign
 * @returns Promise<string> - The base64 encoded signature
 */
export type SignerCallback = (message_hash: string) => Promise<string>;

// Convert string to bytes, padding to 32 bytes
const programIdBytes = Buffer.alloc(32);
Buffer.from("apl-token").copy(programIdBytes);

const TOKEN_PROGRAM_ID = new Uint8Array(programIdBytes);
const SYSTEM_PROGRAM_ID = new Uint8Array([
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 1,
]);

// Export program IDs for external use
export const APL_TOKEN_PROGRAM_ID = TOKEN_PROGRAM_ID;

// Associated Token Account Program ID
const associatedTokenAccountProgramIdBytes = Buffer.alloc(32);
Buffer.from("associated-token-account").copy(
  associatedTokenAccountProgramIdBytes
);
export const ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new Uint8Array(
  associatedTokenAccountProgramIdBytes
);

// Associated Token Account functions
export function deriveAssociatedTokenAddress(
  wallet: Pubkey,
  mint: Pubkey
): [Pubkey, number] {
  // Derive PDA using SHA256 hash of concatenated seeds
  const seeds = Buffer.concat([
    Buffer.from(wallet),
    Buffer.from(APL_TOKEN_PROGRAM_ID),
    Buffer.from(mint),
  ]);

  const programId = Buffer.from(ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID);

  // Use noble hashes for SHA-256
  const hashArray = sha256(Buffer.concat([seeds, programId]));
  // Ensure we have a valid bump seed
  if (hashArray.length < 32) {
    throw new Error("Invalid hash length for PDA derivation");
  }

  // SHA-256 always produces 32 bytes, so this is guaranteed to be a number
  // We've already checked length >= 32, so this access is safe
  const bumpSeed = hashArray[31] as number;

  // Verify our Pubkey conversion
  const pda = hashArray.slice(0, 32);
  if (pda.length !== 32) {
    throw new Error("Invalid PDA length");
  }

  return [pda, bumpSeed];
}

export async function createAssociatedTokenAccountTx(
  wallet: Pubkey,
  mint: Pubkey,
  payer: Pubkey,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const [associatedAccount] = await deriveAssociatedTokenAddress(wallet, mint);

  // Create account
  const createInstruction: Instruction = {
    program_id: APL_TOKEN_PROGRAM_ID,
    accounts: [
      { pubkey: payer, is_signer: true, is_writable: true },
      { pubkey: associatedAccount, is_signer: false, is_writable: true },
    ],
    data: new Uint8Array([]),
  };

  // Assign to token program
  const assignInstruction: Instruction = {
    program_id: APL_TOKEN_PROGRAM_ID,
    accounts: [
      { pubkey: associatedAccount, is_signer: false, is_writable: true },
    ],
    data: new Uint8Array([]),
  };

  // Initialize account
  const initializeInstruction: Instruction = {
    program_id: TOKEN_PROGRAM_ID,
    accounts: [
      { pubkey: associatedAccount, is_signer: false, is_writable: true },
      { pubkey: mint, is_signer: false, is_writable: false },
      { pubkey: wallet, is_signer: false, is_writable: false },
      { pubkey: payer, is_signer: true, is_writable: true },
    ],
    data: serializeInstruction(TokenInstruction.InitializeAccount, {}),
  };

  return createAndSignTransaction(
    [],
    [createInstruction, assignInstruction, initializeInstruction],
    signer
  );
}

/**
 * Callback function for signing transactions.
 * This flexible interface allows different signing implementations:
 * - Node.js environment with private key signing
 * - Web3 wallets (Unisat, etc.) that need custom signing logic
 * - Any other custom signing implementation
 *
 * The callback is responsible for:
 * 1. Populating transaction.signatures with appropriate signatures
 * 2. Optionally modifying transaction.message.signers if needed
 * 3. Returning the signed transaction
 *
 * @param transaction - The RuntimeTransaction to sign
 * @returns Promise<RuntimeTransaction> - The signed transaction
 */

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

export function createAccountInstruction(
  utxo: UtxoMetaData,
  owner: Pubkey
): Instruction {
  // Create instruction data by concatenating:
  // 1. Instruction tag [0] (1 byte)
  // 2. UTXO metadata (36 bytes)
  const instructionTag = new Uint8Array([0]);
  const utxoBytes = UtxoMetaUtil.fromHex(utxo.txid, utxo.vout);
  const data = new Uint8Array(1 + 36); // Total 37 bytes
  data.set(instructionTag, 0);
  data.set(utxoBytes, 1);

  const instruction: Instruction = {
    program_id: SYSTEM_PROGRAM_ID,
    accounts: [{ pubkey: owner, is_signer: true, is_writable: true }],
    data,
  };
  return instruction;
}

export function createAssignOwnershipInstruction(
  from: Pubkey,
  to: Pubkey
): Instruction {
  const instruction: Instruction = {
    program_id: SYSTEM_PROGRAM_ID,
    accounts: [{ pubkey: from, is_signer: true, is_writable: true }],
    data: new Uint8Array([3, ...to]), // Instruction tag 3 followed by owner pubkey
  };
  return instruction;
}

export type Keypair = {
  publicKey: Pubkey;
  secretKey: Pubkey;
};

export function createKeypair(): Keypair {
  const priv = randomPrivateKeyBytes();
  const pub = pubSchnorr(priv);

  return {
    publicKey: pub,
    secretKey: priv,
  };
}

// Instruction Builders
export async function initializeMintTx(
  utxo: UtxoMetaData,
  decimals: number,
  mintAuthority: Pubkey,
  freezeAuthority: Pubkey | null,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const mintKeypair = createKeypair();
  const accountInstruction = createAccountInstruction(
    utxo,
    mintKeypair.publicKey
  );
  const assignInstruction = createAssignOwnershipInstruction(
    mintKeypair.publicKey,
    TOKEN_PROGRAM_ID
  );
  const tokenInstruction: Instruction = {
    program_id: TOKEN_PROGRAM_ID,
    accounts: [],
    data: serializeInstruction(TokenInstruction.InitializeMint, {
      decimals,
      mint_authority: mintAuthority,
      freeze_authority: freezeAuthority,
    }),
  };

  return createAndSignTransaction(
    [mintAuthority],
    [accountInstruction, assignInstruction, tokenInstruction],
    signer
  );
}

export async function initializeAccountTx(
  account: Pubkey,
  mint: Pubkey,
  owner: Pubkey,
  payer: Pubkey,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const data = serializeInstruction(TokenInstruction.InitializeAccount, {});

  const keys = [
    { pubkey: account, is_signer: false, is_writable: true },
    { pubkey: mint, is_signer: false, is_writable: false },
    { pubkey: owner, is_signer: false, is_writable: false },
    { pubkey: payer, is_signer: true, is_writable: true },
  ];

  const tokenInstruction: Instruction = {
    program_id: TOKEN_PROGRAM_ID,
    accounts: keys,
    data: data,
  };

  return createAndSignTransaction([], tokenInstruction, signer);
}

export async function mintToTx(
  mint: Pubkey,
  destination: Pubkey,
  amount: bigint,
  mintAuthority: Pubkey,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const data = serializeInstruction(TokenInstruction.MintTo, { amount });

  const keys = [
    { pubkey: mint, is_signer: false, is_writable: true },
    { pubkey: destination, is_signer: false, is_writable: true },
    { pubkey: mintAuthority, is_signer: true, is_writable: false },
  ];

  const tokenInstruction: Instruction = {
    program_id: TOKEN_PROGRAM_ID,
    accounts: keys,
    data: data,
  };

  return createAndSignTransaction([], tokenInstruction, signer);
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

/**
 * Serialize a public key to a Buffer, handling both Solana PublicKey and Arch Pubkey
 * @param pubkey - The public key to serialize
 * @returns Buffer containing the 32-byte public key
 */
export function serializePubkey(pubkey: Pubkey | PublicKey): Buffer {
  if (pubkey instanceof PublicKey) {
    return Buffer.from(pubkey.toBytes());
  }
  return Buffer.from(pubkey);
}

/**
 * Serialize an optional public key to a Buffer, handling both Solana PublicKey and Arch Pubkey
 * @param pubkey - The public key to serialize, or null
 * @returns Buffer containing the serialized optional public key
 */
export function serializeOptionPubkey(
  pubkey: Pubkey | PublicKey | null
): Buffer {
  if (pubkey === null) {
    // None - [0,0,0,0]
    return Buffer.from([0, 0, 0, 0]);
  }
  // Some - [1,0,0,0] + pubkey bytes
  return Buffer.concat([Buffer.from([1, 0, 0, 0]), serializePubkey(pubkey)]);
}
// to match Rust's exact byte pattern (1 byte tag + optional 32 bytes)

// Main serialization function that matches Rust's pack() implementation
export function serializeInstruction(
  instruction: TokenInstruction,
  data: any
): Buffer {
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
      const { decimals, mint_authority, freeze_authority } = data;
      buffers.push(Buffer.from([decimals]));
      buffers.push(serializePubkey(mint_authority));
      buffers.push(serializeOptionPubkey(freeze_authority));
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
      amountBuf.writeBigUInt64LE(BigInt(amount));
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
      amountBuf.writeBigUInt64LE(BigInt(amount));
      buffers.push(amountBuf);
      buffers.push(Buffer.from([decimals]));
      break;
    }
    case TokenInstruction.SetAuthority: {
      const { authority_type, new_authority } = data;
      buffers.push(Buffer.from([authority_type]));
      buffers.push(serializeOptionPubkey(new_authority));
      break;
    }
    case TokenInstruction.InitializeAccount2:
    case TokenInstruction.InitializeAccount3: {
      const { owner } = data;
      buffers.push(serializePubkey(owner));
      break;
    }
    case TokenInstruction.UiAmountToAmount: {
      const { ui_amount } = data;
      // Convert string to UTF-8 bytes without length prefix
      buffers.push(Buffer.from(ui_amount, "utf8"));
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

// Helper to create and sign a transaction
async function createAndSignTransaction(
  signers: Pubkey[],
  instructions: Instruction | Instruction[],
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  // Convert single instruction to array
  const actualInstructions = Array.isArray(instructions)
    ? instructions
    : [instructions];

  // Build the Arch network Message with proper structure
  const message: Message = {
    signers: signers, // Will be populated by signer callback
    instructions: actualInstructions,
  };

  const messageHash = Buffer.from(MessageUtil.hash(message)).toString("hex");

  const signature = await signer(messageHash);

  const signatureBytes = new Uint8Array(Buffer.from(signature, "base64")).slice(
    2
  );

  // Create RuntimeTransaction with version 1
  const tx: RuntimeTransaction = {
    version: 1,
    signatures: [signatureBytes], // Will be populated by signer callback
    message,
  };

  // Pass to signer callback for signature population
  return tx;
}
