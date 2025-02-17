import { Command } from "commander";
import { handleError, createRpcConnection } from "../utils.js";
import {
  createKeypair,
  createSignerFromKeypair,
  waitForConfirmation,
  createDeployTxs,
  createExecutableTx,
} from "@repo/apl-sdk";
import fs from "fs";
import path from "path";

export default function deployCommand(program: Command) {
  program
    .command("deploy <program-path>")
    .description("Deploy a program from a .so file")
    .action(async (programPath: string) => {
      try {
        const rpcConnection = createRpcConnection();

        // Resolve and validate program path
        const resolvedPath = path.resolve(programPath);
        if (!fs.existsSync(resolvedPath)) {
          throw new Error(`Program file not found at ${resolvedPath}`);
        }

        // Read program binary
        const programData = new Uint8Array(fs.readFileSync(resolvedPath));
        console.log(`Program size: ${programData.length} bytes`);

        // Create new program keypair
        const programKeypair = createKeypair();
        console.log("\nProgram Keypair (SAVE THIS):");
        console.log("----------------------------------------");
        console.log(
          "Public Key:",
          Buffer.from(programKeypair.publicKey).toString("hex")
        );
        console.log(
          "Secret Key:",
          Buffer.from(programKeypair.secretKey).toString("hex")
        );
        console.log("----------------------------------------\n");

        // Get program address
        console.log(
          "Program ID:",
          Buffer.from(programKeypair.publicKey).toString("hex")
        );

        // Create deployment transactions
        console.log("Creating deployment transactions...");
        const deploymentTxs = createDeployTxs(
          programData,
          programKeypair.publicKey
        );
        console.log(`Created ${deploymentTxs.length} deployment transactions`);

        // Send all deployment transactions at once
        console.log("Broadcasting deployment transactions...");
        const results = await rpcConnection.sendTransactions(deploymentTxs);

        // Wait for all transactions to confirm
        console.log("Waiting for confirmations...");
        for (let i = 0; i < results.length; i++) {
          const txid = results[i];
          if (!txid) {
            throw new Error(`Transaction ${i + 1} failed to broadcast`);
          }
          await waitForConfirmation(rpcConnection, txid);
          console.log(`Confirmed chunk ${i + 1}/${deploymentTxs.length}`);
        }

        // Make program executable
        console.log("Making program executable...");
        const signer = createSignerFromKeypair(programKeypair);
        const executableTx = await createExecutableTx(
          programKeypair.publicKey,
          signer
        );
        const executableResult =
          await rpcConnection.sendTransaction(executableTx);
        await waitForConfirmation(rpcConnection, executableResult);

        console.log("Program deployed successfully!");
      } catch (error) {
        handleError(error);
      }
    });
}
