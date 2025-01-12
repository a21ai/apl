import { Command } from "commander";
import {
  loadKeypair,
  createRpcConnection,
  handleError,
  getTaprootAddress,
} from "../utils.js";
import { readConfig } from "../config.js";
import { PubkeyUtil } from "@repo/arch-sdk";

export default function balanceCommand(program: Command) {
  program
    .command("balance")
    .description("Get wallet balance on Arch network")
    .action(async () => {
      try {
        // Read config for keypair and RPC URL
        const config = readConfig();
        const keypairData = loadKeypair();
        const rpcConnection = createRpcConnection();

        const paymentAddress = getTaprootAddress(keypairData);

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
