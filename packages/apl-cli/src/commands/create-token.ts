import { Command } from "commander";
import {
  loadKeypair,
  createSignerFromKeypair,
  handleError,
  createRpcConnection,
} from "../utils.js";

import { PubkeyUtil, UtxoMetaData } from "@repo/arch-sdk";
import {
  createKeypair,
  initializeMintTx,
  sendCoins,
  RPCConfig,
} from "@repo/apl-sdk";

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

        const rpcConfig: RPCConfig = {
          url: "http://bitcoin-node.dev.aws.archnetwork.xyz:18443",
          username: "bitcoin",
          password: "428bae8f3c94f8c39c50757fc89c39bc7e6ebc70ebf8f618",
        };

        const contractAddress = await rpcConnection.getAccountAddress(
          mintKeypair.publicKey
        );
        console.log("Contract Address:", contractAddress);
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
        console.log("tx: ", JSON.stringify(tx));

        const result = await rpcConnection.sendTransaction(tx);
        console.log("Transaction sent successfully!", result);
      } catch (error) {
        handleError(error);
      }
    });
}
