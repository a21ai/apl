import { Command } from "commander";
import { readConfig, setConfig, Network } from "../config.js";
import type { CliConfig } from "../config.js";

export default function configCommand(program: Command) {
  const config = program
    .command("config")
    .description("Configuration management");

  config
    .command("get")
    .description("Get current configuration")
    .action(() => {
      try {
        const config = readConfig();
        console.log(JSON.stringify(config, null, 2));
      } catch (error) {
        console.error("Error reading configuration:", error);
      }
    });

  config
    .command("set")
    .description("Update configuration")
    .option("-u, --url <url>", "RPC endpoint URL")
    .option("-k, --keypair <path>", "keypair file path")
    .option("--network <network>", "network to use (regtest/testnet/mainnet)")
    .option("--rpc-url <url>", "Set RPC URL")
    .option("--rpc-username <username>", "Set RPC username")
    .option("--rpc-password <password>", "Set RPC password")
    .action(async (options) => {
      try {
        const config: Partial<CliConfig> = {
          ...readConfig(),
          rpcConfig: {
            url: options.rpcUrl ?? readConfig().rpcConfig?.url ?? "",
            username:
              options.rpcUsername ?? readConfig().rpcConfig?.username ?? "",
            password:
              options.rpcPassword ?? readConfig().rpcConfig?.password ?? "",
          },
        };

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

        if (
          !options.url &&
          !options.keypair &&
          !options.network &&
          !options.rpcUrl &&
          !options.rpcUsername &&
          !options.rpcPassword
        ) {
          console.error("Error: Please provide at least one option to set");
          process.exitCode = 1;
          return;
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
