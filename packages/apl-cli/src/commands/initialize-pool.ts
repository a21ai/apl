import { Command } from "commander";
import {
  loadKeypair,
  handleError,
  createRpcConnection,
  getUtxo,
} from "../utils.js";
import {
  createKeypair,
  initializePoolTx,
  createSignerFromKeypair,
  waitForConfirmation,
} from "@repo/apl-sdk";
import { PubkeyUtil } from "@repo/apl-sdk";
import { readConfig } from "../config.js";

export default function initializePoolCommand(program: Command) {
  program
    .command("initialize-pool")
    .description("Initialize a new AMM pool")
    .requiredOption("--token-a <pubkey>", "Token A mint address")
    .requiredOption("--token-b <pubkey>", "Token B mint address")
    .requiredOption("--token-a-vault <pubkey>", "Token A vault address")
    .requiredOption("--token-b-vault <pubkey>", "Token B vault address")
    .requiredOption("--lp-mint <pubkey>", "LP token mint address")
    .option("--fee-numerator <number>", "Fee numerator", "25")
    .option("--fee-denominator <number>", "Fee denominator", "10000")
    .action(async (options) => {
      try {
        const rpcConnection = createRpcConnection();
        const poolKeypair = createKeypair();
        const walletKeypair = loadKeypair();
        const config = readConfig();

        const contractAddress = await rpcConnection.getAccountAddress(
          poolKeypair.publicKey
        );
        console.log(
          "Pool Address:",
          Buffer.from(poolKeypair.publicKey).toString("hex")
        );

        // Get UTXO based on network from config - requires 3000 sats
        const utxo = await getUtxo(config.network, contractAddress, 3000);

        const tokenA = PubkeyUtil.fromHex(options.tokenA);
        const tokenB = PubkeyUtil.fromHex(options.tokenB);
        const tokenAVault = PubkeyUtil.fromHex(options.tokenAVault);
        const tokenBVault = PubkeyUtil.fromHex(options.tokenBVault);
        const lpMint = PubkeyUtil.fromHex(options.lpMint);
        const feeNumerator = parseInt(options.feeNumerator);
        const feeDenominator = parseInt(options.feeDenominator);

        console.log("Initializing new AMM pool...");
        console.log(`Token A: ${options.tokenA}`);
        console.log(`Token B: ${options.tokenB}`);
        console.log(`Token A Vault: ${options.tokenAVault}`);
        console.log(`Token B Vault: ${options.tokenBVault}`);
        console.log(`LP Mint: ${options.lpMint}`);
        console.log(`Fee: ${feeNumerator}/${feeDenominator}`);

        // Create and send initialize pool transaction
        const signer = createSignerFromKeypair(poolKeypair);

        const tx = await initializePoolTx(
          poolKeypair,
          tokenA,
          tokenB,
          lpMint,
          tokenAVault,
          tokenBVault,
          walletKeypair.publicKey,
          feeNumerator,
          feeDenominator,
          utxo,
          signer
        );

        const result = await rpcConnection.sendTransaction(tx);
        await waitForConfirmation(rpcConnection, result);
        console.log("Transaction sent successfully!", result);
      } catch (error) {
        handleError(error);
      }
    });
}
