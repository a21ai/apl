import fs from "fs";
import os from "os";
import path from "path";

// Network types supported by the CLI
export type Network = "regtest" | "testnet" | "mainnet";

export interface CliConfig {
  keypair: string;
  rpcUrl: string;
  network: Network;
  rpcConfig: {
    url: string;
    username: string;
    password: string;
  };
}

const CONFIG_DIR = path.join(os.homedir(), ".apl-cli");

const DEFAULT_RPC_CONFIG = {
  url: "http://localhost:18443",
  username: "bitcoin",
  password: "bitcoin",
};

export const DEFAULT_CONFIG: CliConfig = {
  keypair: path.join(CONFIG_DIR, "keypair.json"),
  rpcUrl: "http://localhost:9002",
  network: "regtest",
  rpcConfig: DEFAULT_RPC_CONFIG,
};

const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export function ensureConfigDirExists(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function readConfig(): CliConfig {
  ensureConfigDirExists();

  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      // Write default config directly without using writeConfig
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
      return DEFAULT_CONFIG;
    }

    const configStr = fs.readFileSync(CONFIG_FILE, "utf8");
    const config = JSON.parse(configStr);

    // Ensure all required fields exist
    return {
      ...DEFAULT_CONFIG,
      ...config,
      // Ensure rpcConfig has all required fields with default values as fallback
      rpcConfig: {
        ...DEFAULT_RPC_CONFIG,
        ...config.rpcConfig,
      },
    };
  } catch (error) {
    console.error("Error reading config:", error);
    return DEFAULT_CONFIG;
  }
}

export function writeConfig(config: Partial<CliConfig>): void {
  ensureConfigDirExists();

  try {
    // Read existing config directly from file
    let currentConfig = DEFAULT_CONFIG;
    if (fs.existsSync(CONFIG_FILE)) {
      const configStr = fs.readFileSync(CONFIG_FILE, "utf8");
      currentConfig = {
        ...DEFAULT_CONFIG,
        ...JSON.parse(configStr),
      };
    }

    // Handle rpcConfig updates specially to merge fields
    if (config.rpcConfig) {
      config.rpcConfig = {
        ...currentConfig.rpcConfig,
        ...config.rpcConfig,
      };
    }

    // Merge and write new config
    const newConfig = { ...currentConfig, ...config };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
  } catch (error) {
    console.error("Error writing config:", error);
    throw error;
  }
}

export async function getConfig(): Promise<void> {
  const config = readConfig();

  // Print header
  console.log("\n📝 Current Configuration\n" + "=".repeat(30));

  // Print each config value with appropriate formatting
  console.log("\n🔗 RPC URL:", config.rpcUrl);
  console.log("🔑 Keypair Path:", config.keypair);
  console.log("🌐 Network:", config.network);

  // Print RPC configuration
  console.log("\n🔧 RPC Configuration:");
  console.log("  URL:", config.rpcConfig.url);
  console.log("  Username:", config.rpcConfig.username);
  console.log("  Password:", config.rpcConfig.password ? "********" : "");

  console.log("\n📂 Config Location:", CONFIG_FILE);
  console.log("=".repeat(30) + "\n");
}

export async function setConfig(options: Partial<CliConfig>): Promise<void> {
  writeConfig(options);

  // Show success message and display updated config
  console.log("\n✅ Configuration updated successfully!\n");
  await getConfig();
}
