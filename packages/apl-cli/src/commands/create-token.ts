import { Command } from "commander";
import { loadKeypair, handleError, createRpcConnection } from "../utils.js";
import { PubkeyUtil } from "@repo/arch-sdk";
import {
  createKeypair,
  initializeMintTx,
  sendCoins,
  createSignerFromKeypair,
} from "@repo/apl-sdk";
import { rpcConfig } from "../config.js";

export default function createTokenCommand(program: Command) {
  program
    .command("create-token")
    .description("Create a new token")
    .option("-d, --decimals <number>", "number of decimals", "9")
    .option("-f, --freeze-authority <pubkey>", "optional freeze authority")
    .action(async (options) => {
      try {
        const rpcConnection = createRpcConnection();
        const mintKeypair = createKeypair();
        const walletKeypair = loadKeypair();

        const contractAddress = await rpcConnection.getAccountAddress(
          mintKeypair.publicKey
        );
        console.log(
          "Contract Address:",
          Buffer.from(mintKeypair.publicKey).toString("hex")
        );
        const utxo = await sendCoins(rpcConfig, contractAddress, 3000);

        const decimals = parseInt(options.decimals);
        const freezeAuthority = options.freezeAuthority
          ? PubkeyUtil.fromHex(options.freezeAuthority)
          : null;

        console.log("Creating new token...");
        console.log(
          `Mint Authority: ${Buffer.from(walletKeypair.publicKey).toString(
            "hex"
          )}`
        );
        console.log(`Decimals: ${decimals}`);
        if (freezeAuthority) {
          console.log(`Freeze Authority: ${options.freezeAuthority}`);
        }

        // Create and send initialize mint transaction (stubbed)
        const signer = createSignerFromKeypair(mintKeypair);

        const tx = await initializeMintTx(
          mintKeypair,
          utxo,
          decimals,
          walletKeypair.publicKey,
          freezeAuthority,
          signer
        );

        const result = await rpcConnection.sendTransaction(tx);
        console.log("Transaction sent successfully!", result);
      } catch (error) {
        handleError(error);
      }
    });
}
