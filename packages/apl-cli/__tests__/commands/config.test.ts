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
      await program.parseAsync(["node", "test", "config", "get"]);
      expect(configModule.getConfig).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      mockedConfigModule.getConfig.mockImplementationOnce(() => {
        throw error;
      });

      await program.parseAsync(["node", "test", "config", "get"]);
      expect(console.error).toHaveBeenCalledWith("Error:", error.message);
    });
  });

  describe("set subcommand", () => {
    it("should require at least one option", async () => {
      await program.parseAsync(["node", "test", "config", "set"]);
      expect(process.exitCode).toBe(1);
      expect(console.error).toHaveBeenCalledWith(
        "Error: Please provide at least one option to set"
      );
    });

    it("should call setConfig with url option", async () => {
      const url = "http://test:8899";
      await program.parseAsync(["node", "test", "config", "set", "-u", url]);
      expect(configModule.setConfig).toHaveBeenCalledWith({
        rpcUrl: url,
      });
    });

    it("should call setConfig with keypair option", async () => {
      const keypair = "/test/keypair.json";
      await program.parseAsync([
        "node",
        "test",
        "config",
        "set",
        "-k",
        keypair,
      ]);
      expect(configModule.setConfig).toHaveBeenCalledWith({
        keypair,
      });
    });

    it("should call setConfig with network option", async () => {
      const network = "testnet";
      await program.parseAsync([
        "node",
        "test",
        "config",
        "set",
        "--network",
        network,
      ]);
      expect(configModule.setConfig).toHaveBeenCalledWith({
        network,
      });
    });
  });
});
