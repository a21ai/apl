import { Command } from "commander";
import { createRpcConnection, handleError } from "../utils.js";
import {
  MintUtil,
  TOKEN_PROGRAM_ID,
  getTaprootAddressFromPubkey,
} from "@repo/apl-sdk";

export default function tokensCommand(program: Command) {
  program
    .command("tokens")
    .description("List all tokens")
    .option("-v, --verbose", "Show detailed token information")
    .action(async (options) => {
      try {
        const rpcConnection = createRpcConnection();
        console.log("Fetching tokens...");

        const tokens =
          await rpcConnection.getProgramAccounts(TOKEN_PROGRAM_ID);

        tokens.forEach((token: { account: { data: Uint8Array }; pubkey: Uint8Array }) => {
          const mint = MintUtil.deserialize(Buffer.from(token.account.data));
          if (mint.is_initialized) {
            console.log(
              "\nToken:",
              Buffer.from(token.pubkey).toString("hex"),
              getTaprootAddressFromPubkey(token.pubkey)
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
            console.log(
              "Freeze Authority:",
              mint.freeze_authority
                ? Buffer.from(mint.freeze_authority).toString("hex")
                : "null"
            );
            if (options.verbose) {
              console.log("Is Initialized:", mint.is_initialized);
            }
            console.log("----------------------------------------");
          }
        });
      } catch (error) {
        handleError(error);
      }
    });
}
