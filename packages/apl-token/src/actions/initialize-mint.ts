import {
  Pubkey,
  UtxoMetaData,
  Instruction,
  RuntimeTransaction,
} from "@repo/arch-sdk";
import { createAndSignTransaction, SignerCallback } from "../utils.js";
import { TokenInstruction } from "../serde/token-instruction.js";
import * as TokenInstructionUtil from "../serde/token-instruction.js";
import {
  Keypair,
  createAccountInstruction,
  createAssignOwnershipInstruction,
  createWriteBytesInstruction,
} from "../utils.js";
import { TOKEN_PROGRAM_ID } from "../constants.js";
import { Mint } from "../serde/mint.js";
import * as MintUtil from "../serde/mint.js";

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

  const mint: Mint = {
    mint_authority: mintAuthority,
    supply: BigInt(0),
    decimals,
    is_initialized: false,
    freeze_authority: freezeAuthority,
  };

  const writeBytesInstruction = createWriteBytesInstruction(
    mintKeypair.publicKey,
    0,
    MintUtil.serialize(mint)
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
    data: TokenInstructionUtil.serialize(TokenInstruction.InitializeMint2, {
      decimals,
      mint_authority: mintAuthority,
      freeze_authority: freezeAuthority,
    }),
  };

  return createAndSignTransaction(
    [mintKeypair.publicKey],
    [
      accountInstruction,
      writeBytesInstruction,
      assignInstruction,
      tokenInstruction,
    ],
    signer
  );
}
