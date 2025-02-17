import { Pubkey, RuntimeTransaction, Message } from "@repo/arch-sdk";
import { createWriteBytesInstruction } from "../utils.js";
import { SYSTEM_PROGRAM_ID } from "../constants.js";

// Maximum transaction size limit
const RUNTIME_TX_SIZE_LIMIT = 10240;

/**
 * Calculate the maximum number of bytes that can be included in a single extend_bytes instruction
 * by subtracting the transaction overhead from the total size limit
 */
function calculateExtendBytesMaxLen(): number {
  // Create a sample message with minimum data to calculate overhead
  const sampleMessage: Message = {
    signers: [SYSTEM_PROGRAM_ID],
    instructions: [
      createWriteBytesInstruction(
        SYSTEM_PROGRAM_ID,
        0,
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0])
      ),
    ],
  };

  // Create a sample transaction to calculate overhead
  const sampleTx: RuntimeTransaction = {
    version: 0,
    signatures: [new Uint8Array(64).fill(0)],
    message: sampleMessage,
  };

  // Calculate max data size by subtracting overhead from limit
  // Note: This is an approximation since we can't directly serialize in JS
  // Transaction overhead includes:
  // - version (1 byte)
  // - signatures length (1 byte) + signature (64 bytes)
  // - message header (3 bytes)
  // - signers length (1 byte) + signer (32 bytes)
  // - instructions length (1 byte)
  // - instruction data (program id + accounts + data)
  const estimatedOverhead = 150; // Conservative estimate of overhead
  return RUNTIME_TX_SIZE_LIMIT - estimatedOverhead;
}

// Calculate the maximum chunk size once
const EXTEND_BYTES_MAX_LEN = calculateExtendBytesMaxLen();

/**
 * Creates a list of transactions to deploy program data
 * @param programData The program binary data to deploy
 * @param programId The public key of the program account
 * @returns Array of transactions to deploy the program
 */
export function createDeployTxs(
  programData: Uint8Array,
  programId: Pubkey
): RuntimeTransaction[] {
  // Split program data into chunks
  const chunks = [];
  for (let i = 0; i < programData.length; i += EXTEND_BYTES_MAX_LEN) {
    chunks.push(programData.slice(i, i + EXTEND_BYTES_MAX_LEN));
  }

  // Create transactions for all chunks
  return chunks.map((chunk, i) => {
    const offset = i * EXTEND_BYTES_MAX_LEN;

    // Create write bytes instruction for this chunk
    const writeInstruction = createWriteBytesInstruction(
      programId,
      offset,
      new Uint8Array(chunk)
    );

    return {
      version: 0,
      signatures: [],
      message: {
        signers: [programId],
        instructions: [writeInstruction],
      },
    };
  });
}
