import { Command } from "commander";
import { getConfig, setConfig } from "../config.js";
import { Network } from "../config.js";

export default function configCommand(program: Command) {
  const config = program
    .command("config")
    .description("Configuration management");

  config
    .command("get")
    .description("Get current configuration")
    .action(async () => {
      try {
        await getConfig();
      } catch (error) {
        console.error(
          "Error:",
          error instanceof Error ? error.message : "Unknown error"
        );
        process.exitCode = 1;
      }
    });

  config
    .command("set")
    .description("Update configuration")
    .option("-u, --url <url>", "RPC endpoint URL")
    .option("-k, --keypair <path>", "keypair file path")
    .option("--network <network>", "network to use (regtest/testnet/mainnet)")
    .action(async (options) => {
      try {
        const config: { rpcUrl?: string; keypair?: string; network?: Network } =
          {};

        if (options.url) config.rpcUrl = options.url;
        if (options.keypair) config.keypair = options.keypair;
        if (options.network) {
          if (!["regtest", "testnet", "mainnet"].includes(options.network)) {
            throw new Error(
              "Invalid network. Must be regtest, testnet, or mainnet"
            );
          }
          config.network = options.network as Network;
        }

        await setConfig(config);
      } catch (error) {
        console.error(
          "Error:",
          error instanceof Error ? error.message : "Unknown error"
        );
        process.exitCode = 1;
      }
    });
}
