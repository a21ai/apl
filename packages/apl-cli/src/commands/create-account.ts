import { Command } from "commander";
import { loadKeypair, createRpcConnection, handleError } from "../utils.js";
import { PubkeyUtil } from "@repo/arch-sdk";
import {
  createSignerFromKeypair,
  AssociatedTokenUtil,
  associatedTokenTx,
  sendCoins,
  waitForConfirmation,
} from "@repo/apl-sdk";
import { rpcConfig } from "../config.js";

export default function createAccountCommand(program: Command) {
  program
    .command("create-account <tokenAddress>")
    .description("Create an associated token account")
    .option(
      "-o, --owner <ownerAddress>",
      "Optional owner address (hex encoded public key)"
    )
    .action(async (tokenAddress: string, options: { owner?: string }) => {
      try {
        const keypair = loadKeypair();
        const mintPubkey = PubkeyUtil.fromHex(tokenAddress);
        const rpcConnection = createRpcConnection();

        // Determine owner - use provided owner address if available, otherwise use keypair
        const ownerPubkey = options.owner
          ? PubkeyUtil.fromHex(options.owner)
          : keypair.publicKey;

        // Verify token exists
        const tokenInfo = await rpcConnection.readAccountInfo(mintPubkey);

        if (!tokenInfo || !tokenInfo.data) {
          throw new Error("Invalid token mint account");
        }

        console.log(`Creating account for token: ${tokenAddress}`);
        console.log(`Owner: ${Buffer.from(ownerPubkey).toString("hex")}`);

        const associatedTokenPubkey =
          AssociatedTokenUtil.getAssociatedTokenAddress(
            mintPubkey,
            ownerPubkey,
            true
          );

        console.log(
          `AssociatedTokenAccount: ${Buffer.from(associatedTokenPubkey).toString("hex")}`
        );

        try {
          const associatedTokenInfo = await rpcConnection.readAccountInfo(
            associatedTokenPubkey
          );
          console.log(`Associated token info: ${associatedTokenInfo}`);
        } catch (e) {
          console.log(`Associated token account does not exist. Creating...`);

          // Create associated token account
          const signer = createSignerFromKeypair(keypair);

          const associatedTokenAddress = await rpcConnection.getAccountAddress(
            associatedTokenPubkey
          );

          const utxo = await sendCoins(rpcConfig, associatedTokenAddress, 3000);

          const tx = await associatedTokenTx(
            utxo,
            associatedTokenPubkey,
            ownerPubkey, // Use the determined owner pubkey
            mintPubkey,
            signer
          );

          const result = await rpcConnection.sendTransaction(tx);
          await waitForConfirmation(rpcConnection, result);
          console.log("Transaction sent successfully!", result);
        }
      } catch (error) {
        handleError(error);
      }
    });
}
