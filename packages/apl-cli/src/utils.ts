import fs from "fs";
import { RpcConnection, PubkeyUtil } from "@repo/arch-sdk";
import { readConfig } from "./config.js";
import { Keypair } from "@repo/apl-sdk";

/**
 * Create RPC connection from config
 * @returns {RpcConnection} Configured RPC connection
 */
export function createRpcConnection(): RpcConnection {
  const config = readConfig();
  return new RpcConnection(config.rpcUrl);
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
