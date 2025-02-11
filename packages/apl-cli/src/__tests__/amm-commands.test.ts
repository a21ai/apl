import { describe, expect, test } from "@jest/globals";
import { execSync } from "child_process";

describe("AMM CLI commands", () => {
  describe("initialize-pool command", () => {
    test("shows help text", () => {
      const output = execSync("node ./dist/index.js initialize-pool --help").toString();
      expect(output).toContain("Initialize a new AMM pool");
      expect(output).toContain("--token-a");
      expect(output).toContain("--token-b");
      expect(output).toContain("--token-a-vault");
      expect(output).toContain("--token-b-vault");
      expect(output).toContain("--lp-mint");
      expect(output).toContain("--fee-numerator");
      expect(output).toContain("--fee-denominator");
    });

    test("requires mandatory options", () => {
      expect(() => {
        execSync("node ./dist/index.js initialize-pool");
      }).toThrow();
    });
  });

  describe("add-liquidity command", () => {
    test("shows help text", () => {
      const output = execSync("node ./dist/index.js add-liquidity --help").toString();
      expect(output).toContain("Add liquidity to an AMM pool");
      expect(output).toContain("--pool");
      expect(output).toContain("--token-a-vault");
      expect(output).toContain("--token-b-vault");
      expect(output).toContain("--lp-mint");
      expect(output).toContain("--user-token-a");
      expect(output).toContain("--user-token-b");
      expect(output).toContain("--user-lp");
      expect(output).toContain("--token-a-amount");
      expect(output).toContain("--token-b-amount");
      expect(output).toContain("--min-lp-amount");
    });

    test("requires mandatory options", () => {
      expect(() => {
        execSync("node ./dist/index.js add-liquidity");
      }).toThrow();
    });
  });

  describe("remove-liquidity command", () => {
    test("shows help text", () => {
      const output = execSync("node ./dist/index.js remove-liquidity --help").toString();
      expect(output).toContain("Remove liquidity from an AMM pool");
      expect(output).toContain("--pool");
      expect(output).toContain("--token-a-vault");
      expect(output).toContain("--token-b-vault");
      expect(output).toContain("--lp-mint");
      expect(output).toContain("--user-token-a");
      expect(output).toContain("--user-token-b");
      expect(output).toContain("--user-lp");
      expect(output).toContain("--lp-amount");
      expect(output).toContain("--min-token-a-amount");
      expect(output).toContain("--min-token-b-amount");
    });

    test("requires mandatory options", () => {
      expect(() => {
        execSync("node ./dist/index.js remove-liquidity");
      }).toThrow();
    });
  });

  describe("swap command", () => {
    test("shows help text", () => {
      const output = execSync("node ./dist/index.js swap --help").toString();
      expect(output).toContain("Swap tokens through an AMM pool");
      expect(output).toContain("--pool");
      expect(output).toContain("--input-vault");
      expect(output).toContain("--output-vault");
      expect(output).toContain("--user-input");
      expect(output).toContain("--user-output");
      expect(output).toContain("--amount-in");
      expect(output).toContain("--min-amount-out");
    });

    test("requires mandatory options", () => {
      expect(() => {
        execSync("node ./dist/index.js swap");
      }).toThrow();
    });
  });
});
