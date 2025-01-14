import {
  Pubkey,
  UtxoMetaData,
  Instruction,
  RuntimeTransaction,
  UtxoMetaUtil,
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
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
} from "../constants.js";
import { Mint } from "../serde/mint.js";
import * as MintUtil from "../serde/mint.js";

export async function associatedTokenTx(
  utxo: UtxoMetaData,
  associatedToken: Pubkey,
  owner: Pubkey,
  mint: Pubkey,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const accountInstruction = createAccountInstruction(
    utxo,
    associatedToken,
    false
  );

  //   const mint: Mint = {
  //     mint_authority: mintAuthority,
  //     supply: BigInt(0),
  //     decimals,
  //     is_initialized: false,
  //     freeze_authority: freezeAuthority,
  //   };

  //   const writeBytesInstruction = createWriteBytesInstruction(
  //     mintKeypair.publicKey,
  //     0,
  //     MintUtil.serialize(mint)
  //   );

  //   const assignInstruction = createAssignOwnershipInstruction(
  //     mintKeypair.publicKey,
  //     TOKEN_PROGRAM_ID
  //   );

  const utxoBytes = UtxoMetaUtil.fromHex(utxo.txid, utxo.vout);
  const data = new Uint8Array(36 + 32); // Total 68 bytes
  data.set(utxoBytes, 0);
  data.set(SYSTEM_PROGRAM_ID, 36);

  const tokenInstruction: Instruction = {
    program_id: ASSOCIATED_TOKEN_PROGRAM_ID,
    accounts: [
      { pubkey: associatedToken, is_signer: false, is_writable: true },
      { pubkey: owner, is_signer: false, is_writable: false },
      { pubkey: mint, is_signer: false, is_writable: false },
      { pubkey: SYSTEM_PROGRAM_ID, is_signer: false, is_writable: false },
      { pubkey: TOKEN_PROGRAM_ID, is_signer: false, is_writable: false },
    ],
    data: data,
  };

  return createAndSignTransaction([], [tokenInstruction], signer);
}
