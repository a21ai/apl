import { Command } from "commander";
import fs from "fs";
import path from "path";
import { handleError } from "../utils.js";
import { DEFAULT_CONFIG } from "../config.js";
import { randomPrivateKeyBytes } from "@scure/btc-signer/utils";
import { pubSchnorr } from "@scure/btc-signer/utils";

export default function createKeypairCommand(program: Command) {
  program
    .command("create-keypair")
    .description("Creates a local private keypair and saves to file")
    .option("-o, --output <path>", "output file path", DEFAULT_CONFIG.keypair)
    .option("-f, --force", "force overwrite if file exists")
    .action((options) => {
      try {
        const filePath = path.resolve(options.output);

        // Check if file already exists and handle accordingly
        if (fs.existsSync(filePath) && !options.force) {
          console.error(`Error: Keypair file already exists at ${filePath}`);
          console.error("Use --force flag to overwrite existing keypair");
          process.exit(1);
        }

        // Create directory if it doesn't exist
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const priv = randomPrivateKeyBytes();
        const pub = pubSchnorr(priv);

        fs.writeFileSync(
          filePath,
          JSON.stringify(
            {
              publicKey: Buffer.from(pub).toString("hex"),
              secretKey: Buffer.from(priv).toString("hex"),
            },
            null,
            2
          )
        );

        console.log(`Keypair saved to ${filePath}`);
      } catch (error) {
        handleError(error);
      }
    });
}
