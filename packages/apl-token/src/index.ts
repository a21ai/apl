import { PublicKey } from "@solana/web3.js";
import { 
  Pubkey,
  RuntimeTransaction,
  Message,
  Instruction,
  AccountMeta
} from "@saturnbtcio/arch-sdk";
import { Keypair } from "@solana/web3.js"; // Keep only for test key generation
import { Buffer } from 'buffer';
import { sha256 } from '@noble/hashes/sha2';

// Type for converting Solana PublicKey to Arch Pubkey
type SolanaToArchPubkey = (solanaKey: Keypair['publicKey']) => Pubkey;
export const toArchPubkey: SolanaToArchPubkey = (solanaKey) => {
  const bytes = solanaKey.toBytes();
  if (bytes.length !== 32) {
    throw new Error('Invalid public key length');
  }
  return new Uint8Array(bytes);
};

// APL Token Program ID - matches Rust implementation
// pub fn id() -> Pubkey {
//     Pubkey::from_slice(b"apl-token00000000000000000000000")
// }
// Convert string to bytes, padding to 32 bytes
const programIdBytes = Buffer.alloc(32);
Buffer.from("apl-token").copy(programIdBytes);

const TOKEN_PROGRAM_ID = new Uint8Array(programIdBytes);

// Export program IDs for external use
export const APL_TOKEN_PROGRAM_ID = TOKEN_PROGRAM_ID;

// Associated Token Account Program ID
const associatedTokenAccountProgramIdBytes = Buffer.alloc(32);
Buffer.from("associated-token-account").copy(associatedTokenAccountProgramIdBytes);
export const ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new Uint8Array(associatedTokenAccountProgramIdBytes);

// Associated Token Account functions
export async function deriveAssociatedTokenAddress(
  wallet: Pubkey,
  mint: Pubkey
): Promise<[Pubkey, number]> {
  // Derive PDA using SHA256 hash of concatenated seeds
  const seeds = Buffer.concat([
    Buffer.from(wallet),
    Buffer.from(APL_TOKEN_PROGRAM_ID),
    Buffer.from(mint)
  ]);
  
  const programId = Buffer.from(ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID);
  
  // Use noble hashes for SHA-256
  const hash = sha256(Buffer.concat([seeds, programId]));

  // hash is already a Uint8Array from noble hashes
  const hashArray = hash;
  // Ensure we have a valid bump seed
  if (hashArray.length < 32) {
    throw new Error('Invalid hash length for PDA derivation');
  }
  
  // SHA-256 always produces 32 bytes, so this is guaranteed to be a number
  // We've already checked length >= 32, so this access is safe
  const bumpSeed = hashArray[31] as number;
  
  // Verify our Pubkey conversion
  const pda = hashArray.slice(0, 32);
  if (pda.length !== 32) {
    throw new Error('Invalid PDA length');
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
      { pubkey: associatedAccount, is_signer: false, is_writable: true }
    ],
    data: new Uint8Array([])
  };

  // Assign to token program
  const assignInstruction: Instruction = {
    program_id: APL_TOKEN_PROGRAM_ID,
    accounts: [
      { pubkey: associatedAccount, is_signer: false, is_writable: true }
    ],
    data: new Uint8Array([])
  };

  // Initialize account
  const initializeInstruction = createTokenInstruction(
    TokenInstruction.InitializeAccount,
    APL_TOKEN_PROGRAM_ID,
    [
      { pubkey: associatedAccount, is_signer: false, is_writable: true },
      { pubkey: mint, is_signer: false, is_writable: false },
      { pubkey: wallet, is_signer: false, is_writable: false },
      { pubkey: payer, is_signer: true, is_writable: true }
    ],
    serializeInstruction(TokenInstruction.InitializeAccount, {})
  );

  return createAndSignTransaction(
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
export type SignerCallback = (transaction: RuntimeTransaction) => Promise<RuntimeTransaction>;

/**
 * Mock signer for testing purposes.
 * In real usage, implement this with actual signing logic:
 * - For Node.js: Use private key to generate signatures
 * - For Web3: Use wallet.signTransaction or similar
 */
/**
 * Mock signer for testing purposes.
 * In real usage, implement this with actual signing logic:
 * - For Node.js: Use private key to generate signatures
 * - For Web3: Use wallet.signTransaction or similar
 */
export const mockSigner: SignerCallback = async (tx: RuntimeTransaction): Promise<RuntimeTransaction> => {
  // Preserve the original transaction structure
  const signedTx: RuntimeTransaction = {
    version: tx.version,
    message: {
      signers: [], // In real impl, add actual signers
      instructions: tx.message.instructions
    },
    signatures: [] // In real impl, add actual Uint8Array signatures
  };
  return signedTx;
};

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
  mint: Pubkey,
  decimals: number,
  mintAuthority: Pubkey,
  freezeAuthority: Pubkey | null,
  payer: Pubkey,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const data = serializeInstruction(TokenInstruction.InitializeMint, {
    decimals,
    mint_authority: mintAuthority,
    freeze_authority: freezeAuthority,
  });

  const keys = [
    { pubkey: mint, is_signer: false, is_writable: true },
    { pubkey: payer, is_signer: true, is_writable: true },
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

  const tokenInstruction = createTokenInstruction(
    TokenInstruction.InitializeAccount,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(tokenInstruction, signer);
}

export async function transferTx(
  source: Pubkey,
  destination: Pubkey,
  amount: bigint,
  owner: Pubkey,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const data = serializeInstruction(TokenInstruction.Transfer, { amount });

  const keys = [
    { pubkey: source, is_signer: false, is_writable: true },
    { pubkey: destination, is_signer: false, is_writable: true },
    { pubkey: owner, is_signer: true, is_writable: false }
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
  source: Pubkey,
  delegate: Pubkey,
  owner: Pubkey,
  amount: bigint,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const data = serializeInstruction(TokenInstruction.Approve, { amount });

  const keys = [
    { pubkey: source, is_signer: false, is_writable: true },
    { pubkey: delegate, is_signer: false, is_writable: false },
    { pubkey: owner, is_signer: true, is_writable: false }
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
  source: Pubkey,
  owner: Pubkey,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const data = serializeInstruction(TokenInstruction.Revoke, {});

  const keys = [
    { pubkey: source, is_signer: false, is_writable: true },
    { pubkey: owner, is_signer: true, is_writable: false }
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
  account: Pubkey,
  currentAuthority: Pubkey,
  newAuthority: Pubkey | null,
  authorityType: AuthorityType,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const data = serializeInstruction(TokenInstruction.SetAuthority, {
    authority_type: authorityType,
    new_authority: newAuthority
  });

  const keys = [
    { pubkey: account, is_signer: false, is_writable: true },
    { pubkey: currentAuthority, is_signer: true, is_writable: false }
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
    { pubkey: mintAuthority, is_signer: true, is_writable: false }
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
  account: Pubkey,
  mint: Pubkey,
  amount: bigint,
  owner: Pubkey,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const data = serializeInstruction(TokenInstruction.Burn, { amount });

  const keys = [
    { pubkey: account, is_signer: false, is_writable: true },
    { pubkey: mint, is_signer: false, is_writable: true },
    { pubkey: owner, is_signer: true, is_writable: false }
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
  account: Pubkey,
  destination: Pubkey,
  owner: Pubkey,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const data = serializeInstruction(TokenInstruction.CloseAccount, {});

  const keys = [
    { pubkey: account, is_signer: false, is_writable: true },
    { pubkey: destination, is_signer: false, is_writable: true },
    { pubkey: owner, is_signer: true, is_writable: false }
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
  account: Pubkey,
  mint: Pubkey,
  authority: Pubkey,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const data = serializeInstruction(TokenInstruction.FreezeAccount, {});

  const keys = [
    { pubkey: account, is_signer: false, is_writable: true },
    { pubkey: mint, is_signer: false, is_writable: false },
    { pubkey: authority, is_signer: true, is_writable: false }
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
  multisig: Pubkey,
  m: number,
  signers: Pubkey[],
  payer: Pubkey,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const data = serializeInstruction(TokenInstruction.InitializeMultisig, { m });

  const keys = [
    { pubkey: multisig, is_signer: false, is_writable: true },
    ...signers.map(signer => ({
      pubkey: signer,
      is_signer: false,
      is_writable: false
    }))
  ];

  const tokenInstruction = createTokenInstruction(TokenInstruction.InitializeMultisig, TOKEN_PROGRAM_ID, keys, data);
  return createAndSignTransaction(tokenInstruction, signer);
}

export async function thawAccountTx(
  account: Pubkey,
  mint: Pubkey,
  authority: Pubkey,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const data = serializeInstruction(TokenInstruction.ThawAccount, {});

  const keys = [
    { pubkey: account, is_signer: false, is_writable: true },
    { pubkey: mint, is_signer: false, is_writable: false },
    { pubkey: authority, is_signer: true, is_writable: false }
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
export function serializeOptionPubkey(pubkey: Pubkey | PublicKey | null): Buffer {
  if (pubkey === null) {
    // None - [0,0,0,0]
    return Buffer.from([0, 0, 0, 0]);
  }
  // Some - [1,0,0,0] + pubkey bytes
  return Buffer.concat([
    Buffer.from([1, 0, 0, 0]),
    serializePubkey(pubkey)
  ]);
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
  programId: Pubkey,
  keys: Array<{
    pubkey: Pubkey;
    is_signer: boolean;
    is_writable: boolean;
  }>,
  data: Buffer
): Instruction {
  // Convert keys to Arch SDK AccountMeta format
  const accounts: AccountMeta[] = keys.map(key => ({
    pubkey: key.pubkey,
    is_signer: key.is_signer,    // Use snake_case to match Arch SDK
    is_writable: key.is_writable // Use snake_case to match Arch SDK
  }));

  // Create Arch SDK Instruction
  return {
    program_id: programId,
    accounts,
    data: new Uint8Array(data)
  };
}

// Helper to create and sign a transaction
async function createAndSignTransaction(
  instructions: Instruction | Instruction[],
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  // Convert single instruction to array
  const actualInstructions = Array.isArray(instructions) ? instructions : [instructions];

  // Build the Arch network Message with proper structure
  const message: Message = {
    signers: [], // Will be populated by signer callback
    instructions: actualInstructions.map(instruction => ({
      program_id: instruction.program_id,
      accounts: instruction.accounts.map(account => ({
        pubkey: account.pubkey,
        is_signer: account.is_signer,
        is_writable: account.is_writable
      })),
      data: instruction.data
    }))
  };

  // Create RuntimeTransaction with version 1
  const runtimeTx: RuntimeTransaction = {
    version: 1,
    signatures: [], // Will be populated by signer callback
    message
  };

  // Pass to signer callback for signature population
  return await signer(runtimeTx);
}
