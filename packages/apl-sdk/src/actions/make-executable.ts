import { Pubkey, RuntimeTransaction } from "@repo/arch-sdk";
import {
  createAndSignTransaction,
  SignerCallback,
  createExecutableInstruction,
} from "../utils.js";

/**
 * Creates a transaction to make a program executable
 * @param programId The public key of the program to make executable
 * @param signer Callback function for signing the transaction
 * @returns Promise that resolves to the transaction
 */
export async function createExecutableTx(
  programId: Pubkey,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const executableInstruction = createExecutableInstruction(programId);

  return createAndSignTransaction([programId], [executableInstruction], signer);
}
