import { Command } from "commander";
import { createRpcConnection, handleError } from "../utils.js";
import { PubkeyUtil } from "@repo/arch-sdk";

export default function supplyCommand(program: Command) {
  program
    .command("supply <tokenAddress>")
    .description("Get total token supply")
    .action(async (tokenAddress: string) => {
      try {
        const mintPubkey = PubkeyUtil.fromHex(tokenAddress);
        const rpcConnection = createRpcConnection();

        console.log("Fetching token supply...");
        console.log(`Token Address: ${tokenAddress}`);

        // Stub: In real implementation, we would:
        // 1. Use rpcConnection to fetch mint account info
        // 2. Parse mint data to get total supply
        // 3. Display formatted supply with proper decimals
        console.log("Supply: Stub - Will implement actual supply check");
      } catch (error) {
        handleError(error);
      }
    });
}
