import { Command } from "commander";
import { createRpcConnection, handleError, loadKeypair } from "../utils.js";
import {
  MintUtil,
  TOKEN_PROGRAM_ID,
  getTaprootAddressFromPubkey,
  AssociatedTokenUtil,
  TokenAccountUtil,
} from "@repo/apl-sdk";

export default function balanceCommand(program: Command) {
  program
    .command("balance")
    .description("Show token balances for all accounts")
    .option("-v, --verbose", "Show detailed token information")
    .action(async (options) => {
      try {
        const rpcConnection = createRpcConnection();
        const keypair = loadKeypair();

        // Display user's public key and address
        console.log(
          "\nMy Public Key:",
          Buffer.from(keypair.publicKey).toString("hex")
        );
        console.log(
          "My Address:",
          getTaprootAddressFromPubkey(keypair.publicKey)
        );
        console.log("\nFetching token balances...");

        // Get all token mints
        const mints = await rpcConnection.getProgramAccounts(TOKEN_PROGRAM_ID);

        for (const mint of mints) {
          try {
            const mintData = MintUtil.deserialize(
              Buffer.from(mint.account.data as Uint8Array)
            );
            if (!mintData.is_initialized) continue;

            // Derive associated token account for this mint
            const associatedTokenPubkey =
              AssociatedTokenUtil.getAssociatedTokenAddress(
                mint.pubkey,
                keypair.publicKey
              );

            // Try to fetch the associated token account
            try {
              const tokenAccountInfo = await rpcConnection.readAccountInfo(
                associatedTokenPubkey
              );

              if (tokenAccountInfo?.data) {
                const tokenAccount = TokenAccountUtil.deserialize(
                  Buffer.from(tokenAccountInfo.data)
                );

                // Only show tokens with non-zero balance unless verbose mode
                if (tokenAccount.amount > 0n || options.verbose) {
                  console.log(
                    "\nToken Pubkey:",
                    Buffer.from(mint.pubkey).toString("hex")
                  );
                  console.log(
                    "Token Address:",
                    getTaprootAddressFromPubkey(mint.pubkey)
                  );
                  console.log("Balance:", tokenAccount.amount.toString());

                  if (options.verbose) {
                    console.log("Decimals:", mintData.decimals);
                    console.log("Total Supply:", mintData.supply.toString());
                    console.log(
                      "State:",
                      ["Uninitialized", "Initialized", "Frozen"][
                        tokenAccount.state
                      ]
                    );
                    if (tokenAccount.delegate) {
                      console.log(
                        "Delegated Amount:",
                        tokenAccount.delegated_amount.toString()
                      );
                    }
                  }
                  console.log("----------------------------------------");
                }
              }
            } catch (error) {
              if (options.verbose) {
                console.log(
                  "\nToken:",
                  getTaprootAddressFromPubkey(mint.pubkey)
                );
                console.log("No associated token account found");
                console.log("----------------------------------------");
              }
            }
          } catch (error) {}
        }
      } catch (error) {
        handleError(error);
      }
    });
}
