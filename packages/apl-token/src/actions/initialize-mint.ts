import {
  Pubkey,
  UtxoMetaData,
  Instruction,
  RuntimeTransaction,
} from "@repo/arch-sdk";
import { createAndSignTransaction, SignerCallback } from "../utils.js";
import {
  TokenInstruction,
  serializeInstruction,
  serializeOptionPubkey,
} from "../serde/token-instruction.js";
import {
  Keypair,
  createAccountInstruction,
  createAssignOwnershipInstruction,
  createWriteBytesInstruction,
} from "../utils.js";
import { TOKEN_PROGRAM_ID } from "../constants.js";

export async function initializeMintTx(
  mintKeypair: Keypair,
  utxo: UtxoMetaData,
  decimals: number,
  mintAuthority: Pubkey,
  freezeAuthority: Pubkey | null,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const accountInstruction = createAccountInstruction(
    utxo,
    mintKeypair.publicKey
  );
  // Total buffer size: 82 bytes
  // Layout:
  // Total buffer size: 82 bytes
  // Layout:
  // - mint_authority: 36 bytes (4 byte tag + 32 byte pubkey)
  // - supply: 8 bytes (always 0 for initialization)
  // - decimals: 1 byte (little-endian u8)
  // - is_initialized: 1 byte (always 0 for initialization)
  // - freeze_authority: 36 bytes (4 byte tag + 32 byte pubkey)
  // const mintBuf = Buffer.alloc(82, 0);
  const mintBuf = Buffer.alloc(82, 0);

  // Write mint authority
  mintBuf.set(serializeOptionPubkey(mintAuthority), 0);

  // Write supply (8 bytes of 0 for initialization)
  // Already zeroed by Buffer.alloc

  // Write decimals as little-endian u8
  mintBuf.writeUInt8(decimals, 44);

  // Write is_initialized (0 for initialization)
  // Already zeroed by Buffer.alloc

  // Write freeze authority
  mintBuf.set(serializeOptionPubkey(freezeAuthority), 46);

  const writeBytesInstruction = createWriteBytesInstruction(
    mintKeypair.publicKey,
    0,
    mintBuf
  );

  const assignInstruction = createAssignOwnershipInstruction(
    mintKeypair.publicKey,
    TOKEN_PROGRAM_ID
  );
  const tokenInstruction: Instruction = {
    program_id: TOKEN_PROGRAM_ID,
    accounts: [
      { pubkey: mintKeypair.publicKey, is_signer: true, is_writable: true },
    ],
    data: serializeInstruction(TokenInstruction.InitializeMint2, {
      decimals,
      mint_authority: mintAuthority,
      freeze_authority: freezeAuthority,
    }),
  };

  console.log("tokenInstruction: ", tokenInstruction);

  return createAndSignTransaction(
    [mintKeypair.publicKey],
    // [accountInstruction, assigninstruction, tokeninstruction],
    [
      accountInstruction,
      writeBytesInstruction,
      assignInstruction,
      tokenInstruction,
    ],
    signer
  );
}
