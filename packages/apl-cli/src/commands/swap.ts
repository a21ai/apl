import { Command } from "commander";
import {
  loadKeypair,
  handleError,
  createRpcConnection,
} from "../utils.js";
import {
  swapTx,
  createSignerFromKeypair,
  waitForConfirmation,
} from "@repo/apl-sdk";
import { PubkeyUtil } from "@repo/arch-sdk";

export default function swapCommand(program: Command) {
  program
    .command("swap")
    .description("Swap tokens through an AMM pool")
    .requiredOption("--pool <pubkey>", "Pool address")
    .requiredOption("--input-vault <pubkey>", "Input token vault address")
    .requiredOption("--output-vault <pubkey>", "Output token vault address")
    .requiredOption("--user-input <pubkey>", "User's input token account")
    .requiredOption("--user-output <pubkey>", "User's output token account")
    .requiredOption("--amount-in <number>", "Amount of input tokens to swap")
    .option("--min-amount-out <number>", "Minimum output tokens to receive", "0")
    .action(async (options) => {
      try {
        const rpcConnection = createRpcConnection();
        const walletKeypair = loadKeypair();

        const pool = PubkeyUtil.fromHex(options.pool);
        const inputVault = PubkeyUtil.fromHex(options.inputVault);
        const outputVault = PubkeyUtil.fromHex(options.outputVault);
        const userInput = PubkeyUtil.fromHex(options.userInput);
        const userOutput = PubkeyUtil.fromHex(options.userOutput);
        const amountIn = BigInt(options.amountIn);
        const minAmountOut = BigInt(options.minAmountOut);

        console.log("Swapping tokens through AMM pool...");
        console.log(`Pool: ${options.pool}`);
        console.log(`Amount In: ${amountIn}`);
        console.log(`Minimum Amount Out: ${minAmountOut}`);

        // Create and send swap transaction
        const signer = createSignerFromKeypair(walletKeypair);

        const tx = await swapTx(
          pool,
          inputVault,
          outputVault,
          userInput,
          userOutput,
          walletKeypair.publicKey,
          amountIn,
          minAmountOut,
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
