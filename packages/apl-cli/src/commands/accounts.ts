import { Command } from "commander";
import { createRpcConnection, handleError, loadKeypair } from "../utils.js";
import {
  MintUtil,
  TOKEN_PROGRAM_ID,
  getTaprootAddressFromPubkey,
  AssociatedTokenUtil,
  TokenAccountUtil,
} from "@repo/apl-sdk";

export default function accountsCommand(program: Command) {
  program
    .command("accounts")
    .description("List all token accounts")
    .option("-v, --verbose", "Show detailed token information")
    .action(async (options) => {
      try {
        const rpcConnection = createRpcConnection();
        const keypair = loadKeypair();
        console.log("Fetching token accounts...");

        // Get all token mints
        const mints = await rpcConnection.getProgramAccounts(TOKEN_PROGRAM_ID);

        for (const mint of mints) {
          const mintData = MintUtil.deserialize(Buffer.from(mint.account.data as Uint8Array));
          if (!mintData.is_initialized) continue;

          // Derive associated token account for this mint
          const associatedTokenPubkey = AssociatedTokenUtil.getAssociatedTokenAddress(
            mint.pubkey,
            keypair.publicKey
          );

          console.log(
            "\nToken:",
            Buffer.from(mint.pubkey).toString("hex"),
            getTaprootAddressFromPubkey(mint.pubkey)
          );
          console.log("----------------------------------------");

          // Try to fetch the associated token account
          try {
            const tokenAccountInfo = await rpcConnection.readAccountInfo(associatedTokenPubkey);
            
            if (tokenAccountInfo?.data) {
              const tokenAccount = TokenAccountUtil.deserialize(Buffer.from(tokenAccountInfo.data));
              console.log("Balance:", tokenAccount.amount.toString());
              console.log("State:", ["Uninitialized", "Initialized", "Frozen"][tokenAccount.state]);
              if (tokenAccount.delegate) {
                console.log("Delegate:", Buffer.from(tokenAccount.delegate).toString("hex"));
                console.log("Delegated Amount:", tokenAccount.delegated_amount.toString());
              }
              if (options.verbose) {
                console.log("Owner:", Buffer.from(tokenAccount.owner).toString("hex"));
                if (tokenAccount.close_authority) {
                  console.log("Close Authority:", Buffer.from(tokenAccount.close_authority).toString("hex"));
                }
              }
            } else {
              console.log("No associated token account found. Create one using 'create-account'");
            }
          } catch (error) {
            console.log("No associated token account found. Create one using 'create-account'");
          }

          if (options.verbose) {
            console.log(
              "Mint Authority:",
              mintData.mint_authority
                ? Buffer.from(mintData.mint_authority).toString("hex")
                : "null"
            );
            console.log("Supply:", mintData.supply.toString());
            console.log("Decimals:", mintData.decimals);
            console.log(
              "Freeze Authority:",
              mintData.freeze_authority
                ? Buffer.from(mintData.freeze_authority).toString("hex")
                : "null"
            );
          }
          console.log("----------------------------------------");
        }
      } catch (error) {
        handleError(error);
      }
    });
}
