import { Command } from "commander";
import { loadKeypair, handleError, createRpcConnection } from "../utils.js";
import { PubkeyUtil } from "@repo/arch-sdk";
import { createSignerFromKeypair, transferTx, MintUtil, AssociatedTokenUtil } from "@repo/apl-sdk";

export default function transferCommand(program: Command) {
  program
    .command("transfer")
    .description("Transfer tokens from your account to another account")
    .requiredOption("-t, --to <address>", "recipient wallet address")
    .requiredOption("-m, --mint <address>", "token mint address")
    .requiredOption("-a, --amount <number>", "amount to transfer")
    .action(async (options) => {
      try {
        const rpcConnection = createRpcConnection();
        const keypairData = loadKeypair();
        const recipientMainPubkey = PubkeyUtil.fromHex(options.to);
        const mintPubkey = PubkeyUtil.fromHex(options.mint);
        const amount = BigInt(options.amount);

        // Derive associated token accounts for source and destination
        const sourceTokenPubkey = AssociatedTokenUtil.getAssociatedTokenAddress(
          mintPubkey,
          keypairData.publicKey
        );
        const recipientTokenPubkey = AssociatedTokenUtil.getAssociatedTokenAddress(
          mintPubkey,
          recipientMainPubkey
        );

        // Verify both token accounts exist
        console.log("Verifying token accounts...");
        const sourceTokenInfo = await rpcConnection.readAccountInfo(sourceTokenPubkey);
        if (!sourceTokenInfo?.data) {
          throw new Error(`Source token account ${Buffer.from(sourceTokenPubkey).toString("hex")} does not exist. Please create it first using 'create-account ${options.mint}'`);
        }

        const recipientTokenInfo = await rpcConnection.readAccountInfo(recipientTokenPubkey);
        if (!recipientTokenInfo?.data) {
          throw new Error(`Recipient token account ${Buffer.from(recipientTokenPubkey).toString("hex")} does not exist. Please create it first using 'create-account ${options.mint}'`);
        }
        console.log("Token accounts verified successfully.");

        // Fetch mint data to get decimals
        const accountInfo = await rpcConnection.readAccountInfo(mintPubkey);
        if (!accountInfo?.data) {
          throw new Error("Invalid or uninitialized mint account");
        }
        const mintData = MintUtil.deserialize(Buffer.from(accountInfo.data));
        const decimals = mintData.decimals;

        console.log("Creating transfer transaction...");
        console.log(`Source Wallet: ${Buffer.from(keypairData.publicKey).toString("hex")}`);
        console.log(`Recipient Wallet: ${options.to}`);
        console.log(`Mint Address: ${options.mint}`);
        console.log(`Amount: ${options.amount}`);
        console.log(`Decimals: ${decimals} (from mint)`);


        const signer = createSignerFromKeypair(keypairData);
        const tx = await transferTx(
          sourceTokenPubkey,
          mintPubkey,
          recipientTokenPubkey,
          keypairData.publicKey,
          amount,
          decimals,
          signer
        );

        const result = await rpcConnection.sendTransaction(tx);
        console.log("Transaction sent successfully!", result);
      } catch (error) {
        handleError(error);
      }
    });
}
