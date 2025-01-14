import {
  Pubkey,
  Instruction,
  RuntimeTransaction,
} from "@repo/arch-sdk";
import { createAndSignTransaction, SignerCallback } from "../utils.js";
import { TokenInstruction } from "../serde/token-instruction.js";
import * as TokenInstructionUtil from "../serde/token-instruction.js";
import { TOKEN_PROGRAM_ID } from "../constants.js";

export async function transferTx(
  source: Pubkey,
  mint: Pubkey,
  destination: Pubkey,
  owner: Pubkey,
  amount: bigint,
  decimals: number,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const tokenInstruction: Instruction = {
    program_id: TOKEN_PROGRAM_ID,
    accounts: [
      { pubkey: source, is_signer: false, is_writable: true },
      { pubkey: mint, is_signer: false, is_writable: false },
      { pubkey: destination, is_signer: false, is_writable: true },
      { pubkey: owner, is_signer: true, is_writable: false },
    ],
    data: TokenInstructionUtil.serialize(TokenInstruction.TransferChecked, {
      amount,
      decimals,
    }),
  };

  return createAndSignTransaction(
    [owner],
    [tokenInstruction],
    signer
  );
}
