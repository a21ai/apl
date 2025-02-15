import { jest } from "@jest/globals";
import { Command } from "commander";
import fs from "fs";
import path from "path";
import createKeypairCommand from "../src/commands/create-keypair.js";
import * as configModule from "../src/config.js";

// Mock modules
jest.mock("fs");
jest.mock("@scure/btc-signer/utils", () => ({
  randomPrivateKeyBytes: () => new Uint8Array([1, 2, 3, 4]),
  pubSchnorr: () => new Uint8Array([5, 6, 7, 8]),
}));
jest.mock("../src/config.js");

// Mock process.exit
const mockExit = jest
  .spyOn(process, "exit")
  .mockImplementation(() => undefined as never);

// Get mocked modules
const mockedFs = jest.mocked(fs);

describe("create-keypair command", () => {
  let program: Command;

  beforeEach(() => {
    jest.clearAllMocks();
    program = new Command();
    program.exitOverride();
    createKeypairCommand(program);

    // Reset process.exitCode
    process.exitCode = 0;

    // Reset console spies
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Setup default mock implementations
    mockedFs.existsSync.mockReturnValue(false);
    mockedFs.writeFileSync.mockImplementation(() => undefined);
    mockedFs.mkdirSync.mockImplementation(() => undefined);
  });

  it("should create a new keypair file with correct format", async () => {
    const outputPath = "/test/keypair.json";
    mockedFs.existsSync.mockReturnValue(false);

    await program.parseAsync([
      "node",
      "test",
      "create-keypair",
      "-o",
      outputPath,
    ]);

    const expectedContent = {
      publicKey: "05060708",
      secretKey: "01020304",
    };

    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      outputPath,
      JSON.stringify(expectedContent, null, 2)
    );
  });

  it("should create output directory if it doesn't exist", async () => {
    const outputPath = "/test/dir/keypair.json";
    mockedFs.existsSync.mockReturnValue(false);

    await program.parseAsync([
      "node",
      "test",
      "create-keypair",
      "-o",
      outputPath,
    ]);

    expect(mockedFs.mkdirSync).toHaveBeenCalledWith(path.dirname(outputPath), {
      recursive: true,
    });
  });

  it("should handle write errors gracefully", async () => {
    const outputPath = "/test/keypair.json";
    mockedFs.existsSync.mockReturnValue(false);
    mockedFs.writeFileSync.mockImplementation(() => {
      throw new Error("Write failed");
    });

    const consoleSpy = jest.spyOn(console, "error");

    await program.parseAsync([
      "node",
      "test",
      "create-keypair",
      "-o",
      outputPath,
    ]);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error:",
      expect.stringContaining("Write failed")
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
