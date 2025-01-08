import { Pubkey } from "@saturnbtcio/arch-sdk";
import { 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  PublicKey
} from "@solana/web3.js";
import { Buffer } from 'buffer';

// Token Program ID - this should be configured appropriately
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

// Signer callback type
export type SignerCallback = (transaction: Transaction) => Promise<Transaction>;

// Instruction data layouts
export interface InitializeMintData {
  instruction: TokenInstruction.InitializeMint;
  decimals: number;
  mintAuthority: PublicKey;
  freezeAuthority: PublicKey | null;
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
  newAuthority: PublicKey | null;
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
  InitializeMint = 0,      // [0, decimals(1), mint_authority(32), freeze_authority_option(1 + 32)]
  InitializeAccount = 1,    // [1]
  InitializeMultisig = 2,   // [2, m(1)]
  Transfer = 3,            // [3, amount(8)]
  Approve = 4,             // [4, amount(8)]
  Revoke = 5,              // [5]
  SetAuthority = 6,        // [6, authority_type(1), new_authority_option(1 + 32)]
  MintTo = 7,              // [7, amount(8)]
  Burn = 8,                // [8, amount(8)]
  CloseAccount = 9,        // [9]
  FreezeAccount = 10,      // [10]
  ThawAccount = 11,        // [11]
  TransferChecked = 12,    // [12, amount(8), decimals(1)]
  ApproveChecked = 13,     // [13, amount(8), decimals(1)]
  MintToChecked = 14,      // [14, amount(8), decimals(1)]
  BurnChecked = 15,        // [15, amount(8), decimals(1)]
  InitializeAccount2 = 16,  // [16, owner(32)]
  InitializeAccount3 = 17,  // [17, owner(32)]
  InitializeMint2 = 18,    // [18, decimals(1), mint_authority(32), freeze_authority_option(1 + 32)]
  GetAccountDataSize = 19,  // [19]
  InitializeImmutableOwner = 20, // [20]
  AmountToUiAmount = 21,   // [21, amount(8)]
  UiAmountToAmount = 22,   // [22, ui_amount_string(len + string_bytes)]
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

// Instruction Builders
export async function initializeMintTx(
  mint: PublicKey,
  decimals: number,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null,
  payer: PublicKey,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeInstruction(TokenInstruction.InitializeMint, {
    decimals,
    mint_authority: mintAuthority,
    freeze_authority: freezeAuthority,
  });

  const keys = [
    { pubkey: mint, isSigner: false, isWritable: true },
    { pubkey: payer, isSigner: true, isWritable: true },
  ];

  const tokenInstruction = createTokenInstruction(
    TokenInstruction.InitializeMint,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(tokenInstruction, signer);
}

export async function initializeAccountTx(
  account: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  payer: PublicKey,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeInstruction(TokenInstruction.InitializeAccount, {});

  const keys = [
    { pubkey: account, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: owner, isSigner: false, isWritable: false },
    { pubkey: payer, isSigner: true, isWritable: true },
  ];

  const tokenInstruction = createTokenInstruction(
    TokenInstruction.InitializeAccount,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(tokenInstruction, signer);
}

export async function transferTx(
  source: PublicKey,
  destination: PublicKey,
  amount: bigint,
  owner: PublicKey,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeInstruction(TokenInstruction.Transfer, { amount });

  const keys = [
    { pubkey: source, isSigner: false, isWritable: true },
    { pubkey: destination, isSigner: false, isWritable: true },
    { pubkey: owner, isSigner: true, isWritable: false }
  ];

  const tokenInstruction = createTokenInstruction(
    TokenInstruction.Transfer,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(tokenInstruction, signer);
}

export async function approveTx(
  source: PublicKey,
  delegate: PublicKey,
  owner: PublicKey,
  amount: bigint,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeInstruction(TokenInstruction.Approve, { amount });

  const keys = [
    { pubkey: source, isSigner: false, isWritable: true },
    { pubkey: delegate, isSigner: false, isWritable: false },
    { pubkey: owner, isSigner: true, isWritable: false }
  ];

  const tokenInstruction = createTokenInstruction(
    TokenInstruction.Approve,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(tokenInstruction, signer);
}

export async function revokeTx(
  source: PublicKey,
  owner: PublicKey,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeInstruction(TokenInstruction.Revoke, {});

  const keys = [
    { pubkey: source, isSigner: false, isWritable: true },
    { pubkey: owner, isSigner: true, isWritable: false }
  ];

  const tokenInstruction = createTokenInstruction(
    TokenInstruction.Revoke,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(tokenInstruction, signer);
}

export async function setAuthorityTx(
  account: PublicKey,
  currentAuthority: PublicKey,
  newAuthority: PublicKey | null,
  authorityType: AuthorityType,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeInstruction(TokenInstruction.SetAuthority, {
    authority_type: authorityType,
    new_authority: newAuthority
  });

  const keys = [
    { pubkey: account, isSigner: false, isWritable: true },
    { pubkey: currentAuthority, isSigner: true, isWritable: false }
  ];

  const tokenInstruction = createTokenInstruction(
    TokenInstruction.SetAuthority,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(tokenInstruction, signer);
}

export async function mintToTx(
  mint: PublicKey,
  destination: PublicKey,
  amount: bigint,
  mintAuthority: PublicKey,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeInstruction(TokenInstruction.MintTo, { amount });

  const keys = [
    { pubkey: mint, isSigner: false, isWritable: true },
    { pubkey: destination, isSigner: false, isWritable: true },
    { pubkey: mintAuthority, isSigner: true, isWritable: false }
  ];

  const tokenInstruction = createTokenInstruction(
    TokenInstruction.MintTo,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(tokenInstruction, signer);
}

export async function burnTx(
  account: PublicKey,
  mint: PublicKey,
  amount: bigint,
  owner: PublicKey,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeInstruction(TokenInstruction.Burn, { amount });

  const keys = [
    { pubkey: account, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: true },
    { pubkey: owner, isSigner: true, isWritable: false }
  ];

  const tokenInstruction = createTokenInstruction(
    TokenInstruction.Burn,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(tokenInstruction, signer);
}

export async function closeAccountTx(
  account: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeInstruction(TokenInstruction.CloseAccount, {});

  const keys = [
    { pubkey: account, isSigner: false, isWritable: true },
    { pubkey: destination, isSigner: false, isWritable: true },
    { pubkey: owner, isSigner: true, isWritable: false }
  ];

  const tokenInstruction = createTokenInstruction(
    TokenInstruction.CloseAccount,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(tokenInstruction, signer);
}

export async function freezeAccountTx(
  account: PublicKey,
  mint: PublicKey,
  authority: PublicKey,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeInstruction(TokenInstruction.FreezeAccount, {});

  const keys = [
    { pubkey: account, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: authority, isSigner: true, isWritable: false }
  ];

  const tokenInstruction = createTokenInstruction(
    TokenInstruction.FreezeAccount,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(tokenInstruction, signer);
}

export async function initializeMultisigTx(
  multisig: PublicKey,
  m: number,
  signers: PublicKey[],
  payer: PublicKey,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeInstruction(TokenInstruction.InitializeMultisig, { m });

  const keys = [
    { pubkey: multisig, isSigner: false, isWritable: true },
    ...signers.map(signer => ({
      pubkey: signer,
      isSigner: false,
      isWritable: false
    }))
  ];

  const tokenInstruction = createTokenInstruction(TokenInstruction.InitializeMultisig, TOKEN_PROGRAM_ID, keys, data);
  return createAndSignTransaction(tokenInstruction, signer);
}

export async function thawAccountTx(
  account: PublicKey,
  mint: PublicKey,
  authority: PublicKey,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeInstruction(TokenInstruction.ThawAccount, {});

  const keys = [
    { pubkey: account, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: authority, isSigner: true, isWritable: false }
  ];

  const tokenInstruction = createTokenInstruction(
    TokenInstruction.ThawAccount,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(tokenInstruction, signer);
}

// Helper functions for instruction creation and serialization
// Serialization utilities that match Rust token program's byte-level patterns
export function serializeU64LE(value: number | bigint): Buffer {
  const buf = Buffer.alloc(8);
  // Convert to BigInt to handle both number and bigint inputs
  const bigIntValue = BigInt(value);
  // Write as little-endian u64, matching Rust's byte pattern
  for (let i = 0; i < 8; i++) {
    buf[i] = Number((bigIntValue >> BigInt(i * 8)) & BigInt(0xFF));
  }
  return buf;
}

export function serializePubkey(pubkey: PublicKey): Buffer {
  return Buffer.from(pubkey.toBytes());
}

export function serializeOptionPubkey(pubkey: PublicKey | null): Buffer {
  const buffers: Buffer[] = [];
  if (pubkey === null) {
    // None - [0,0,0,0]
    buffers.push(Buffer.from([0, 0, 0, 0]));
  } else {
    // Some - [1,0,0,0] + pubkey bytes
    buffers.push(Buffer.from([1, 0, 0, 0]));
    buffers.push(serializePubkey(pubkey));
  }
  return Buffer.concat(buffers);
}
// to match Rust's exact byte pattern (1 byte tag + optional 32 bytes)

// Main serialization function that matches Rust's pack() implementation
export function serializeInstruction(instruction: TokenInstruction, data: any): Buffer {
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
      buffers.push(Buffer.from(ui_amount, 'utf8'));
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

function createTokenInstruction(
  instruction: TokenInstruction,
  programId: PublicKey,
  keys: Array<{
    pubkey: PublicKey;
    isSigner: boolean;
    isWritable: boolean;
  }>,
  data: Buffer
): TransactionInstruction {
  return new TransactionInstruction({
    keys,
    programId,
    data,
  });
}

// Helper to create and sign a transaction
async function createAndSignTransaction(
  instructions: TransactionInstruction | TransactionInstruction[],
  signer: SignerCallback
): Promise<Transaction> {
  const transaction = new Transaction();
  if (Array.isArray(instructions)) {
    instructions.forEach(ix => transaction.add(ix));
  } else {
    transaction.add(instructions);
  }
  return await signer(transaction);
}
