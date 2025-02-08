import fs from "fs";
import { RpcConnection, PubkeyUtil } from "@repo/arch-sdk";
import { readConfig, rpcConfig, Network } from "./config.js";
import { Keypair, sendCoins } from "@repo/apl-sdk";
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
    return await sendCoins(rpcConfig[network], contractAddress, amount);
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
