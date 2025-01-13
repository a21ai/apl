import { Command } from "commander";
import { loadKeypair, createRpcConnection, handleError } from "../utils.js";
import { readConfig } from "../config.js";
import { PubkeyUtil } from "@repo/arch-sdk";
import { getTaprootAddress } from "@repo/apl-token";

export default function balanceCommand(program: Command) {
  program
    .command("balance")
    .description("Get wallet balance on Arch network")
    .action(async () => {
      try {
        // Read config for keypair and RPC URL
        const config = readConfig();
        const keypair = loadKeypair();
        const rpcConnection = createRpcConnection();

        const paymentAddress = getTaprootAddress(keypair);

        console.log("Payment Address:", paymentAddress);

        const archAdress = await rpcConnection.getAccountAddress(
          PubkeyUtil.fromHex(paymentAddress)
        );

        console.log("Arch Address:", archAdress);

        console.log("Fetching wallet balance...");

        // Stub: In real implementation, we would:
        // 1. Use rpcConnection to fetch account info
        // 2. Parse account data to get balance
        // 3. Display formatted balance
        console.log("Balance: Stub - Will implement actual balance check");
      } catch (error) {
        handleError(error);
      }
    });
}
