import { Command } from "commander";
import {
  loadKeypair,
  handleError,
  createRpcConnection,
  getUtxo,
} from "../utils.js";
import {
  createKeypair,
  initializeMintTx,
  createSignerFromKeypair,
  waitForConfirmation,
  PubkeyUtil,
} from "@repo/apl-sdk";
import { readConfig } from "../config.js";

export default function createTokenCommand(program: Command) {
  program
    .command("create-token")
    .description("Create a new token")
    .option("-d, --decimals <number>", "number of decimals", "9")
    .option("-f, --freeze-authority <pubkey>", "optional freeze authority")
    .option("-m, --mint-keypair <path>", "path to mint keypair file")
    .action(async (options) => {
      try {
        const rpcConnection = createRpcConnection();
        const mintKeypair = options.mintKeypair
          ? loadKeypair(options.mintKeypair)
          : createKeypair();
        const walletKeypair = loadKeypair();
        const config = readConfig();

        const contractAddress = await rpcConnection.getAccountAddress(
          mintKeypair.publicKey
        );
        console.log(
          "Contract Address:",
          Buffer.from(mintKeypair.publicKey).toString("hex")
        );

        // Get UTXO based on network from config - requires 3000 sats
        const utxo = await getUtxo(config.network, contractAddress, 3000);

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

        // Create and send initialize mint transaction
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
        await waitForConfirmation(rpcConnection, result);
        console.log("Transaction sent successfully!", result);
      } catch (error) {
        handleError(error);
      }
    });
}
