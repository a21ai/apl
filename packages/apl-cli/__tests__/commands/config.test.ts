import { jest } from "@jest/globals";
import { Command } from "commander";
import os from "os";
import path from "path";
import configCommand from "../../src/commands/config.js";
import * as configModule from "../../src/config.js";
import type { CliConfig } from "../../src/config.js";

// Mock the config module
jest.mock("../../src/config.js");

// Get mocked module
const mockedConfigModule = jest.mocked(configModule);

// Constants
const CONFIG_DIR = path.join(os.homedir(), ".apl-sdk");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
const DEFAULT_CONFIG: CliConfig = {
  keypair: path.join(os.homedir(), ".apl-sdk", "id.json"),
  rpcUrl: "http://localhost:9002",
  network: "regtest",
  rpcConfig: {
    url: "http://localhost:18443",
    username: "bitcoin",
    password: "bitcoin",
  },
};

describe("Config Command", () => {
  let program: Command;

  beforeEach(() => {
    jest.clearAllMocks();
    program = new Command();
    program.exitOverride();

    // Reset process.exitCode
    process.exitCode = 0;

    // Reset console spies
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Mock getConfig implementation
    mockedConfigModule.getConfig.mockImplementation(async () => {
      console.log("Config File:", CONFIG_FILE);
      console.log("RPC URL:", DEFAULT_CONFIG.rpcUrl);
      console.log("Keypair Path:", DEFAULT_CONFIG.keypair);
    });

    // Mock setConfig implementation
    mockedConfigModule.setConfig.mockImplementation(async (options) => {
      if (Object.keys(options).length === 0) {
        console.error("Error: Please provide at least one option to set");
        process.exitCode = 1;
        return;
      }
      return Promise.resolve();
    });

    // Initialize the command
    configCommand(program);
  });

  describe("get subcommand", () => {
    it("should call getConfig", async () => {
      const config = { ...DEFAULT_CONFIG };
      mockedConfigModule.readConfig.mockReturnValue(config);

      await program.parseAsync(["node", "test", "config", "get"]);
      expect(mockedConfigModule.readConfig).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(JSON.stringify(config, null, 2));
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      mockedConfigModule.readConfig.mockImplementationOnce(() => {
        throw error;
      });

      await program.parseAsync(["node", "test", "config", "get"]);
      expect(console.error).toHaveBeenCalledWith(
        "Error reading configuration:",
        error
      );
    });
  });

  describe("set subcommand", () => {
    it("should require at least one option", async () => {
      mockedConfigModule.readConfig.mockReturnValue(DEFAULT_CONFIG);

      await program.parseAsync(["node", "test", "config", "set"]);
      expect(process.exitCode).toBe(1);
      expect(console.error).toHaveBeenCalledWith(
        "Error: Please provide at least one option to set"
      );
    });

    it("should call setConfig with url option", async () => {
      const url = "http://test:8899";
      mockedConfigModule.readConfig.mockReturnValue(DEFAULT_CONFIG);

      await program.parseAsync(["node", "test", "config", "set", "-u", url]);
      expect(mockedConfigModule.setConfig).toHaveBeenCalledWith({
        ...DEFAULT_CONFIG,
        rpcUrl: url,
      });
    });

    it("should call setConfig with keypair option", async () => {
      const keypair = "/test/keypair.json";
      mockedConfigModule.readConfig.mockReturnValue(DEFAULT_CONFIG);

      await program.parseAsync([
        "node",
        "test",
        "config",
        "set",
        "-k",
        keypair,
      ]);
      expect(mockedConfigModule.setConfig).toHaveBeenCalledWith({
        ...DEFAULT_CONFIG,
        keypair,
      });
    });

    it("should call setConfig with network option", async () => {
      const network = "testnet";
      mockedConfigModule.readConfig.mockReturnValue(DEFAULT_CONFIG);

      await program.parseAsync([
        "node",
        "test",
        "config",
        "set",
        "--network",
        network,
      ]);
      expect(mockedConfigModule.setConfig).toHaveBeenCalledWith({
        ...DEFAULT_CONFIG,
        network,
      });
    });

    it("should call setConfig with RPC options", async () => {
      const rpcUrl = "http://test:18443";
      const rpcUsername = "testuser";
      const rpcPassword = "testpass";
      mockedConfigModule.readConfig.mockReturnValue(DEFAULT_CONFIG);

      await program.parseAsync([
        "node",
        "test",
        "config",
        "set",
        "--rpc-url",
        rpcUrl,
        "--rpc-username",
        rpcUsername,
        "--rpc-password",
        rpcPassword,
      ]);
      expect(mockedConfigModule.setConfig).toHaveBeenCalledWith({
        ...DEFAULT_CONFIG,
        rpcConfig: {
          url: rpcUrl,
          username: rpcUsername,
          password: rpcPassword,
        },
      });
    });
  });
});
