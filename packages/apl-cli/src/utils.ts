import fs from "fs";
import { readConfig, Network } from "./config.js";
import {
  Keypair,
  sendCoins,
  RpcConnection,
  PubkeyUtil,
  UtxoMetaData,
} from "@repo/apl-sdk";
import prompts from "prompts";

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
 * @param path Optional path to keypair file. If not provided, uses path from config
 * @returns {Object} Object containing keypair data and Arch pubkey
 */
export function loadKeypair(path?: string): Keypair {
  const config = readConfig();
  const keypairPath = path || config.keypair;
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, "utf8"));

  return {
    publicKey: PubkeyUtil.fromHex(keypairData.publicKey),
    secretKey: PubkeyUtil.fromHex(keypairData.secretKey),
  };
}

/**
 * Get UTXO based on network type
 * @param network Current network (regtest, testnet, mainnet)
 * @param contractAddress Contract address
 * @param amount Amount to send (for regtest) or required in UTXO (for testnet/mainnet)
 * @returns UTXO information
 */
export async function getUtxo(
  network: Network,
  contractAddress: string,
  amount: number
): Promise<{ txid: string; vout: number }> {
  if (network === "regtest") {
    // For regtest, we use sendCoins to create a new UTXO
    if (!contractAddress) {
      throw new Error("Contract address is required for regtest mode");
    }
    console.log(`Sending ${amount} sats (${amount / 1e8} BTC) to contract...`);
    return await sendCoins(readConfig().rpcConfig, contractAddress, amount);
  } else {
    // For testnet/mainnet, prompt for UTXO details
    console.log(
      `Send exactly ${amount} sats (${amount / 1e8} BTC) to this address: ${contractAddress}`
    );

    const response = await prompts([
      {
        type: "text",
        name: "txid",
        message: `Please enter the transaction ID of your UTXO:`,
        validate: (value) =>
          value.length === 64
            ? true
            : "Transaction ID must be 64 characters long",
      },
      {
        type: "number",
        name: "vout",
        message: "Enter the output index (vout):",
        initial: 0,
        validate: (value) =>
          value >= 0 ? true : "Output index must be non-negative",
      },
    ]);

    if (!response.txid || response.vout === undefined) {
      throw new Error("UTXO information is required for testnet/mainnet");
    }

    return {
      txid: response.txid,
      vout: response.vout,
    };
  }
}

export async function sendCoinsToContract(
  network: Network,
  contractAddress: string,
  amount: number
): Promise<UtxoMetaData> {
  const config = readConfig();
  return await sendCoins(config.rpcConfig, contractAddress, amount);
}
