import {
  Pubkey,
  Instruction,
  RuntimeTransaction,
} from "@repo/arch-sdk";
import { createAndSignTransaction, SignerCallback } from "../utils.js";
import { TokenInstruction } from "../serde/token-instruction.js";
import * as TokenInstructionUtil from "../serde/token-instruction.js";
import { TOKEN_PROGRAM_ID } from "../constants.js";

export async function mintToTx(
  mint: Pubkey,
  recipient: Pubkey,
  amount: bigint,
  mintAuthority: Pubkey,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const tokenInstruction: Instruction = {
    program_id: TOKEN_PROGRAM_ID,
    accounts: [
      { pubkey: mint, is_signer: false, is_writable: true },
      { pubkey: recipient, is_signer: false, is_writable: true },
      { pubkey: mintAuthority, is_signer: true, is_writable: false },
    ],
    data: TokenInstructionUtil.serialize(TokenInstruction.MintTo, {
      amount,
    }),
  };

  return createAndSignTransaction(
    [mintAuthority],
    [tokenInstruction],
    signer
  );
}
