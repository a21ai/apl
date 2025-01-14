import { Command } from "commander";
import { loadKeypair, handleError, createRpcConnection } from "../utils.js";
import { PubkeyUtil } from "@repo/arch-sdk";
import { createSignerFromKeypair, transferTx } from "@repo/apl-sdk";

export default function transferCommand(program: Command) {
  program
    .command("transfer")
    .description("Transfer tokens to another account")
    .requiredOption("-s, --source <address>", "source token account address")
    .requiredOption("-d, --destination <address>", "destination token account address")
    .requiredOption("-m, --mint <address>", "token mint address")
    .requiredOption("-a, --amount <number>", "amount to transfer")
    .requiredOption("-n, --decimals <number>", "token decimals")
    .action(async (options) => {
      try {
        const keypairData = loadKeypair();
        const sourcePubkey = PubkeyUtil.fromHex(options.source);
        const destinationPubkey = PubkeyUtil.fromHex(options.destination);
        const mintPubkey = PubkeyUtil.fromHex(options.mint);
        const amount = BigInt(options.amount);
        const decimals = parseInt(options.decimals);

        console.log("Creating transfer transaction...");
        console.log(`Source Address: ${options.source}`);
        console.log(`Destination Address: ${options.destination}`);
        console.log(`Mint Address: ${options.mint}`);
        console.log(`Amount: ${options.amount}`);
        console.log(`Decimals: ${decimals}`);

        const signer = createSignerFromKeypair(keypairData);
        const tx = await transferTx(
          sourcePubkey,
          mintPubkey,
          destinationPubkey,
          keypairData.publicKey,
          amount,
          decimals,
          signer
        );

        const rpcConnection = createRpcConnection();
        const result = await rpcConnection.sendTransaction(tx);
        console.log("Transaction sent successfully!", result);
      } catch (error) {
        handleError(error);
      }
    });
}
