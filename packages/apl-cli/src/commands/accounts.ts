import { Command } from "commander";
import { loadKeypair, createRpcConnection, handleError } from "../utils.js";
import { PubkeyUtil } from "@repo/arch-sdk";
import { TOKEN_PROGRAM_ID } from "@repo/apl-sdk";
import { MintUtil } from "@repo/apl-sdk";

export default function accountsCommand(program: Command) {
  program
    .command("accounts")
    .description("List all token accounts")
    .option("-v, --verbose", "Show detailed token information")
    .action(async (options) => {
      try {
        const rpcConnection = createRpcConnection();
        console.log("Fetching token accounts...");

        const accounts =
          await rpcConnection.getProgramAccounts(TOKEN_PROGRAM_ID);

        accounts.forEach((account) => {
          const mint = MintUtil.deserialize(Buffer.from(account.account.data));
          console.log(
            "\nToken Account:",
            Buffer.from(account.pubkey).toString("hex")
          );
          console.log("----------------------------------------");
          console.log(
            "Mint Authority:",
            mint.mint_authority
              ? Buffer.from(mint.mint_authority).toString("hex")
              : "null"
          );
          console.log("Supply:", mint.supply.toString());
          console.log("Decimals:", mint.decimals);
          console.log("Is Initialized:", mint.is_initialized);
          console.log(
            "Freeze Authority:",
            mint.freeze_authority
              ? Buffer.from(mint.freeze_authority).toString("hex")
              : "null"
          );
          console.log("----------------------------------------");
        });
      } catch (error) {
        handleError(error);
      }
    });
}
