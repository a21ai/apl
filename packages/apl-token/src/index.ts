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

// Layout helpers
const uint64 = (property: string) => {
  return {
    property,
    type: 'u64'
  };
};

const uint8 = (property: string) => {
  return {
    property,
    type: 'u8'
  };
};

const publicKey = (property: string) => {
  return {
    property,
    type: 'pubkey'
  };
};

const optionalPublicKey = (property: string) => {
  return {
    property,
    type: 'optionalPubkey'
  };
};

// Additional instruction data layouts
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

// Instruction Layout Schemas
const layouts = {
  initializeMint: {
    instruction: uint8('instruction'),
    decimals: uint8('decimals'),
    mintAuthority: publicKey('mintAuthority'),
    freezeAuthority: optionalPublicKey('freezeAuthority'),
  },
  initializeAccount: {
    instruction: uint8('instruction'),
  },
  transfer: {
    instruction: uint8('instruction'),
    amount: uint64('amount'),
  },
  transferChecked: {
    instruction: uint8('instruction'),
    amount: uint64('amount'),
    decimals: uint8('decimals'),
  },
  approve: {
    instruction: uint8('instruction'),
    amount: uint64('amount'),
  },
  revoke: {
    instruction: uint8('instruction'),
  },
  setAuthority: {
    instruction: uint8('instruction'),
    authorityType: uint8('authorityType'),
    newAuthority: optionalPublicKey('newAuthority')
  },
  approveChecked: {
    instruction: uint8('instruction'),
    amount: uint64('amount'),
    decimals: uint8('decimals'),
  },
  mintTo: {
    instruction: uint8('instruction'),
    amount: uint64('amount'),
  },
  mintToChecked: {
    instruction: uint8('instruction'),
    amount: uint64('amount'),
    decimals: uint8('decimals'),
  },
  burn: {
    instruction: uint8('instruction'),
    amount: uint64('amount'),
  },
  burnChecked: {
    instruction: uint8('instruction'),
    amount: uint64('amount'),
    decimals: uint8('decimals'),
  },
  closeAccount: {
    instruction: uint8('instruction'),
  },
  freezeAccount: {
    instruction: uint8('instruction'),
  },
  thawAccount: {
    instruction: uint8('instruction'),
  },
};

// Instruction Types (matching Rust enum)
export enum TokenInstruction {
  InitializeMint = 0,
  InitializeAccount = 1,
  InitializeMultisig = 2,
  Transfer = 3,
  Approve = 4,
  Revoke = 5,
  SetAuthority = 6,
  MintTo = 7,
  Burn = 8,
  CloseAccount = 9,
  FreezeAccount = 10,
  ThawAccount = 11,
  TransferChecked = 12,
  ApproveChecked = 13,
  MintToChecked = 14,
  BurnChecked = 15,
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
  const data = serializeLayout(layouts.initializeMint, {
    instruction: TokenInstruction.InitializeMint,
    decimals,
    mintAuthority,
    freezeAuthority,
  });

  const keys = [
    { pubkey: mint, isSigner: false, isWritable: true },
    { pubkey: payer, isSigner: true, isWritable: true },
  ];

  const instruction = createTokenInstruction(
    TokenInstruction.InitializeMint,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(instruction, signer);
}

export async function initializeAccountTx(
  account: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  payer: PublicKey,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeLayout(layouts.initializeAccount || {
    instruction: uint8('instruction')
  }, {
    instruction: TokenInstruction.InitializeAccount
  });

  const keys = [
    { pubkey: account, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: owner, isSigner: false, isWritable: false },
    { pubkey: payer, isSigner: true, isWritable: true },
  ];

  const instruction = createTokenInstruction(
    TokenInstruction.InitializeAccount,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(instruction, signer);
}

export async function transferTx(
  source: PublicKey,
  destination: PublicKey,
  amount: bigint,
  owner: PublicKey,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeLayout(layouts.transfer, {
    instruction: TokenInstruction.Transfer,
    amount
  });

  const keys = [
    { pubkey: source, isSigner: false, isWritable: true },
    { pubkey: destination, isSigner: false, isWritable: true },
    { pubkey: owner, isSigner: true, isWritable: false }
  ];

  const instruction = createTokenInstruction(
    TokenInstruction.Transfer,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(instruction, signer);
}

export async function approveTx(
  source: PublicKey,
  delegate: PublicKey,
  owner: PublicKey,
  amount: bigint,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeLayout(layouts.approve, {
    instruction: TokenInstruction.Approve,
    amount
  });

  const keys = [
    { pubkey: source, isSigner: false, isWritable: true },
    { pubkey: delegate, isSigner: false, isWritable: false },
    { pubkey: owner, isSigner: true, isWritable: false }
  ];

  const instruction = createTokenInstruction(
    TokenInstruction.Approve,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(instruction, signer);
}

export async function revokeTx(
  source: PublicKey,
  owner: PublicKey,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeLayout(layouts.revoke, {
    instruction: TokenInstruction.Revoke
  });

  const keys = [
    { pubkey: source, isSigner: false, isWritable: true },
    { pubkey: owner, isSigner: true, isWritable: false }
  ];

  const instruction = createTokenInstruction(
    TokenInstruction.Revoke,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(instruction, signer);
}

export async function setAuthorityTx(
  account: PublicKey,
  currentAuthority: PublicKey,
  newAuthority: PublicKey | null,
  authorityType: AuthorityType,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeLayout(layouts.setAuthority, {
    instruction: TokenInstruction.SetAuthority,
    authorityType,
    newAuthority: newAuthority || null
  });

  const keys = [
    { pubkey: account, isSigner: false, isWritable: true },
    { pubkey: currentAuthority, isSigner: true, isWritable: false }
  ];

  const instruction = createTokenInstruction(
    TokenInstruction.SetAuthority,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(instruction, signer);
}

export async function mintToTx(
  mint: PublicKey,
  destination: PublicKey,
  amount: bigint,
  mintAuthority: PublicKey,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeLayout(layouts.mintTo, {
    instruction: TokenInstruction.MintTo,
    amount
  });

  const keys = [
    { pubkey: mint, isSigner: false, isWritable: true },
    { pubkey: destination, isSigner: false, isWritable: true },
    { pubkey: mintAuthority, isSigner: true, isWritable: false }
  ];

  const instruction = createTokenInstruction(
    TokenInstruction.MintTo,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(instruction, signer);
}

export async function burnTx(
  account: PublicKey,
  mint: PublicKey,
  amount: bigint,
  owner: PublicKey,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeLayout(layouts.burn, {
    instruction: TokenInstruction.Burn,
    amount
  });

  const keys = [
    { pubkey: account, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: true },
    { pubkey: owner, isSigner: true, isWritable: false }
  ];

  const instruction = createTokenInstruction(
    TokenInstruction.Burn,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(instruction, signer);
}

export async function closeAccountTx(
  account: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeLayout(layouts.closeAccount, {
    instruction: TokenInstruction.CloseAccount
  });

  const keys = [
    { pubkey: account, isSigner: false, isWritable: true },
    { pubkey: destination, isSigner: false, isWritable: true },
    { pubkey: owner, isSigner: true, isWritable: false }
  ];

  const instruction = createTokenInstruction(
    TokenInstruction.CloseAccount,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(instruction, signer);
}

export async function freezeAccountTx(
  account: PublicKey,
  mint: PublicKey,
  authority: PublicKey,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeLayout(layouts.freezeAccount, {
    instruction: TokenInstruction.FreezeAccount
  });

  const keys = [
    { pubkey: account, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: authority, isSigner: true, isWritable: false }
  ];

  const instruction = createTokenInstruction(
    TokenInstruction.FreezeAccount,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(instruction, signer);
}

export async function thawAccountTx(
  account: PublicKey,
  mint: PublicKey,
  authority: PublicKey,
  signer: SignerCallback
): Promise<Transaction> {
  const data = serializeLayout(layouts.thawAccount, {
    instruction: TokenInstruction.ThawAccount
  });

  const keys = [
    { pubkey: account, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: authority, isSigner: true, isWritable: false }
  ];

  const instruction = createTokenInstruction(
    TokenInstruction.ThawAccount,
    TOKEN_PROGRAM_ID,
    keys,
    data
  );

  return createAndSignTransaction(instruction, signer);
}

// Helper functions for instruction creation and serialization
function serializeLayout(layout: any, data: any): Buffer {
  const buffer = Buffer.alloc(1000); // Max size, will trim
  let offset = 0;

  for (const [key, value] of Object.entries(layout)) {
    const field = value as { property: string; type: string };
    const dataValue = data[field.property];

    switch (field.type) {
      case 'u8':
        buffer.writeUInt8(dataValue, offset);
        offset += 1;
        break;
      case 'u64':
        const bigIntValue = BigInt(dataValue);
        buffer.writeBigUInt64LE(bigIntValue, offset);
        offset += 8;
        break;
      case 'pubkey':
        const pubkeyBytes = (dataValue as PublicKey).toBytes();
        buffer.set(pubkeyBytes, offset);
        offset += 32;
        break;
      case 'optionalPubkey':
        if (dataValue === null) {
          buffer.writeUInt32LE(0, offset);
          offset += 36; // 4 bytes for option tag + 32 bytes of zeroes
        } else {
          buffer.writeUInt32LE(1, offset);
          offset += 4;
          const pubkeyBytes = (dataValue as PublicKey).toBytes();
          buffer.set(pubkeyBytes, offset);
          offset += 32;
        }
        break;
      default:
        throw new Error(`Unknown type: ${field.type}`);
    }
  }

  return buffer.slice(0, offset);
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
  instruction: TransactionInstruction,
  signer: SignerCallback
): Promise<Transaction> {
  const transaction = new Transaction().add(instruction);
  return await signer(transaction);
}
