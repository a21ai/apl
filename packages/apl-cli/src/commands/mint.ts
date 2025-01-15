import { Command } from "commander";
import { loadKeypair, handleError, createRpcConnection } from "../utils.js";
import { PubkeyUtil } from "@repo/arch-sdk";
import {
  createSignerFromKeypair,
  mintToTx,
  MintUtil,
  AssociatedTokenUtil,
} from "@repo/apl-sdk";

export default function mintCommand(program: Command) {
  program
    .command("mint")
    .description("Mint tokens to recipient (requires mint authority)")
    .requiredOption("-m, --mint <address>", "token mint address")
    .option(
      "-t, --to <address>",
      "recipient address (defaults to local keypair)"
    )
    .requiredOption("-a, --amount <number>", "amount to mint")
    .action(async (options) => {
      try {
        const keypairData = loadKeypair();
        const mintPubkey = PubkeyUtil.fromHex(options.mint);
        const recipientMainPubkey = options.to
          ? PubkeyUtil.fromHex(options.to)
          : keypairData.publicKey;
        const amount = BigInt(options.amount);
        const rpcConnection = createRpcConnection();

        // Derive recipient's associated token account
        const recipientTokenPubkey =
          AssociatedTokenUtil.getAssociatedTokenAddress(
            mintPubkey,
            recipientMainPubkey
          );

        // Verify recipient's token account exists
        console.log("Verifying recipient's token account...");
        const recipientTokenInfo =
          await rpcConnection.readAccountInfo(recipientTokenPubkey);
        if (!recipientTokenInfo?.data) {
          throw new Error(
            `Recipient token account ${Buffer.from(recipientTokenPubkey).toString("hex")} does not exist. Please create it first using 'create-account ${options.mint}'`
          );
        }
        console.log("Token account verified successfully.");

        // Fetch and validate mint account data
        const mintInfo = await rpcConnection.readAccountInfo(mintPubkey);

        if (!mintInfo || !mintInfo.data) {
          throw new Error("Invalid or uninitialized mint account");
        }

        // Deserialize mint data to get authority
        const mintData = MintUtil.deserialize(Buffer.from(mintInfo.data));

        // Validate mint authority
        if (mintData.mint_authority === null) {
          throw new Error(
            "Mint authority is null; this mint has a fixed supply and cannot mint further tokens."
          );
        }

        if (
          !Buffer.from(mintData.mint_authority).equals(
            Buffer.from(keypairData.publicKey)
          )
        ) {
          throw new Error(
            "Local keypair does not match on-chain mint authority. You are not authorized to mint."
          );
        }

        console.log("Creating mint transaction...");
        console.log(`Mint Address: ${options.mint}`);
        console.log(
          `To Address: ${Buffer.from(recipientMainPubkey).toString("hex")} ${options.to ? "" : "(local keypair)"}`
        );
        console.log(`Amount: ${options.amount}`);
        console.log(
          `Mint Authority: ${Buffer.from(mintData.mint_authority).toString("hex")}`
        );

        // Create and send mint transaction
        const signer = createSignerFromKeypair(keypairData);
        const tx = await mintToTx(
          mintPubkey,
          recipientTokenPubkey,
          amount,
          keypairData.publicKey,
          signer
        );

        const result = await rpcConnection.sendTransaction(tx);
        console.log("Transaction sent successfully!", result);
      } catch (error) {
        handleError(error);
      }
    });
}
