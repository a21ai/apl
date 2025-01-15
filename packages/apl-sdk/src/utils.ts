import {
  UtxoMetaData,
  Pubkey,
  Instruction,
  UtxoMetaUtil,
  RuntimeTransaction,
  Message,
  MessageUtil,
  SignatureUtil,
} from "@repo/arch-sdk";
import { SYSTEM_PROGRAM_ID } from "./constants.js";
import * as btc from "@scure/btc-signer";
import { randomPrivateKeyBytes } from "@scure/btc-signer/utils";
import { pubSchnorr } from "@scure/btc-signer/utils";
import { Signer as Bip322Signer } from "bip322-js";
import { bech32m } from "bech32";
// const bitcore = require("bitcore-lib-inquisition");

export function createAccountInstruction(
  utxo: UtxoMetaData,
  owner: Pubkey,
  is_signer: boolean = true
): Instruction {
  // Create instruction data by concatenating:
  // 1. Instruction tag [0] (1 byte)
  // 2. UTXO metadata (36 bytes)
  const instructionTag = new Uint8Array([0]);
  const utxoBytes = UtxoMetaUtil.fromHex(utxo.txid, utxo.vout);
  const data = new Uint8Array(1 + 36); // Total 37 bytes
  data.set(instructionTag, 0);
  data.set(utxoBytes, 1);

  const instruction: Instruction = {
    program_id: SYSTEM_PROGRAM_ID,
    accounts: [{ pubkey: owner, is_signer, is_writable: true }],
    data,
  };
  return instruction;
}

export function createAssignOwnershipInstruction(
  from: Pubkey,
  to: Pubkey
): Instruction {
  const instruction: Instruction = {
    program_id: SYSTEM_PROGRAM_ID,
    accounts: [{ pubkey: from, is_signer: true, is_writable: true }],
    data: new Uint8Array([3, ...to]), // Instruction tag 3 followed by owner pubkey
  };
  return instruction;
}

export function createWriteBytesInstruction(
  pubkey: Pubkey,
  offset: number,
  data: Uint8Array
): Instruction {
  // Create instruction data by concatenating:
  // 1. Instruction tag [1] (1 byte)
  // 2. Offset (4 bytes, little-endian)
  // 3. Length (4 bytes, little-endian)
  // 4. Data bytes
  const instructionTag = new Uint8Array([1]);
  const offsetBytes = new Uint8Array(4);
  const lenBytes = new Uint8Array(4);

  // Convert offset and length to little-endian bytes
  new DataView(offsetBytes.buffer).setUint32(0, offset, true);
  new DataView(lenBytes.buffer).setUint32(0, data.length, true);

  // Concatenate all components
  const instructionData = new Uint8Array(1 + 4 + 4 + data.length);
  instructionData.set(instructionTag, 0);
  instructionData.set(offsetBytes, 1);
  instructionData.set(lenBytes, 5);
  instructionData.set(data, 9);

  const instruction: Instruction = {
    program_id: SYSTEM_PROGRAM_ID,
    accounts: [{ pubkey, is_signer: true, is_writable: true }],
    data: instructionData,
  };
  return instruction;
}

export type Keypair = {
  publicKey: Pubkey;
  secretKey: Pubkey;
};

export function createKeypair(): Keypair {
  const priv = randomPrivateKeyBytes();
  const pub = pubSchnorr(priv);

  return {
    publicKey: pub,
    secretKey: priv,
  };
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
 * @param message_hash - The message hash to sign
 * @returns Promise<string> - The base64 encoded signature
 */
export type SignerCallback = (message_hash: string) => Promise<string>;

// Helper to create and sign a transaction
export async function createAndSignTransaction(
  signers: Pubkey[],
  instructions: Instruction | Instruction[],
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  // Convert single instruction to array
  const actualInstructions = Array.isArray(instructions)
    ? instructions
    : [instructions];

  // Build the Arch network Message with proper structure
  const message: Message = {
    signers: signers, // Will be populated by signer callback
    instructions: actualInstructions,
  };

  let signatureBytes: Uint8Array = new Uint8Array();
  if (signers.length > 0) {
    const messageHash = Buffer.from(MessageUtil.hash(message)).toString("hex");
    const signature = await signer(messageHash);
    signatureBytes = SignatureUtil.adjustSignature(
      new Uint8Array(Buffer.from(signature, "base64"))
    );
  }

  // Create RuntimeTransaction with version 1
  const tx: RuntimeTransaction = {
    version: 0,
    signatures: signers.length > 0 ? [signatureBytes] : [], // Will be populated by signer callback
    message,
  };

  // Pass to signer callback for signature population
  return tx;
}

/**
 * Get taproot address from keypair
 * @param keypair {publicKey: string, secretKey: string}
 * @returns {address: string}
 */
export function getTaprootAddress(keypair: Keypair): string {
  return getTaprootAddressFromPubkey(keypair.publicKey);
}

/**
 * Get taproot address from pubkey
 * @param publicKey {Pubkey}
 * @returns {address: string}
 */
export function getTaprootAddressFromPubkey(publicKey: Pubkey): string {
  const { address } = btc.p2tr(publicKey);
  return address!;
}

/**
 * Extract the public key from a taproot address by decoding the bech32m format
 * @param address The taproot address (starts with bc1p)
 * @returns The x-only public key used in the taproot address
 */
export function getPubkeyFromTaprootAddress(address: string): Pubkey {
  try {
    // const a = new bitcore.Address(address);
    // console.log("Address:", a.toString());

    // Decode the Bech32m address
    const decoded = bech32m.decode(address);

    // Extract witness version and program
    const witnessVersion = decoded.words[0]; // Should be 1 for Taproot
    const program = bech32m.fromWords(decoded.words.slice(1));

    // For taproot addresses, witness version should be 1 and program length should be 32 bytes
    if (witnessVersion !== 1 || program.length !== 32) {
      throw new Error(
        "Invalid Taproot address: incorrect witness version or program length"
      );
    }

    // The program is the x-only public key for Taproot
    return new Uint8Array(program);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Invalid taproot address: ${message}`);
  }
}

/**
 * Create a signer callback that uses a Solana keypair
 * @param keypair {publicKey: string, secretKey: string}
 * @returns SignerCallback function
 */
export function createSignerFromKeypair(keypair: Keypair): SignerCallback {
  const address = getTaprootAddress(keypair);
  const wif = btc.WIF().encode(keypair.secretKey);

  return async (message: string): Promise<string> => {
    const sig = Bip322Signer.sign(wif, address!, message) as string;
    return sig;
  };
}

/**
 * Read a 64-bit unsigned integer from a buffer in little-endian format
 * Browser-compatible version that works with both Buffer and Uint8Array
 */
export function readUInt64LE(
  buffer: Buffer | Uint8Array,
  offset: number
): bigint {
  const view = new DataView(
    buffer instanceof Buffer
      ? buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.length
        )
      : buffer.buffer
  );
  const low = view.getUint32(offset, true);
  const high = view.getUint32(offset + 4, true);
  return (BigInt(high) << 32n) | BigInt(low);
}
