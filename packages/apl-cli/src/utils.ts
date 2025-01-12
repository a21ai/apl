import fs from "fs";
import {
  RpcConnection,
  RuntimeTransaction,
  PubkeyUtil,
  Pubkey,
} from "@repo/arch-sdk";
import { readConfig } from "./config.js";
import * as btc from "@scure/btc-signer";
import { Signer } from "bip322-js";
import { SignerCallback, Keypair } from "@repo/apl-token";
import bip371 from "bitcoinjs-lib/src/psbt/bip371.js";

/**
 * Create RPC connection from config
 * @returns {RpcConnection} Configured RPC connection
 */
export function createRpcConnection(): RpcConnection {
  const config = readConfig();
  return new RpcConnection(config.rpcUrl);
}

/**
 * Get taproot address from keypair
 * @param keypair {publicKey: string, secretKey: string}
 * @returns {address: string}
 */
export function getTaprootAddress(keypair: Keypair): string {
  const { address } = btc.p2tr(keypair.publicKey);
  return address!;
}

/**
 * Create a signer callback that uses a Solana keypair
 * @param keypair {publicKey: string, secretKey: string}
 * @returns SignerCallback function
 */
export function createSignerFromKeypair(keypair: Keypair): SignerCallback {
  const privkey = keypair.secretKey;
  const address = getTaprootAddress(keypair);
  const wif = btc.WIF().encode(privkey);

  return async (message: string): Promise<string> => {
    const sig = Signer.sign(wif, address!, message) as string;
    return sig;
  };
}

/**
 * Handle errors consistently across commands
 * @param error Error to handle
 */
export function handleError(error: unknown): never {
  if (error instanceof Error) {
    console.error("Error:", error.message);
  } else {
    console.error("An unknown error occurred");
  }
  process.exit(1);
}

/**
 * Load keypair data and convert public key to Arch format
 * @returns {Object} Object containing keypair data and Arch pubkey
 */
export function loadKeypair(): Keypair {
  const config = readConfig();
  const keypairData = JSON.parse(fs.readFileSync(config.keypair, "utf8"));

  return {
    publicKey: PubkeyUtil.fromHex(keypairData.publicKey),
    secretKey: PubkeyUtil.fromHex(keypairData.secretKey),
  };
}
