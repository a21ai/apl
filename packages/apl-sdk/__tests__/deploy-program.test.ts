import { Pubkey, RuntimeTransaction, Instruction } from "@repo/arch-sdk";
import { createDeployTxs } from "../src/actions/deploy-program";
import { SYSTEM_PROGRAM_ID } from "../src/constants";

describe("deploy-program", () => {
  describe("createDeployTxs", () => {
    it("should create correct transactions for small program data", () => {
      // Test data smaller than max chunk size
      const programData = new Uint8Array([1, 2, 3, 4, 5]);
      const programId = SYSTEM_PROGRAM_ID;

      const txs = createDeployTxs(programData, programId);

      expect(txs.length).toBeGreaterThan(0);
      const firstTx = txs[0];
      expect(firstTx).toBeDefined();

      // Type assertion since we've verified firstTx exists
      const tx = firstTx as RuntimeTransaction;
      expect(tx.message.signers).toEqual([programId]);
      expect(tx.message.instructions).toHaveLength(1);

      // Verify instruction data contains correct offset and data
      const instruction = tx.message.instructions[0] as Instruction;
      expect(instruction).toBeDefined();
      expect(instruction.program_id).toBe(programId);
      expect(instruction.data).toBeDefined();
      expect(instruction.data.length).toBeGreaterThan(5); // Account for offset bytes
    });

    it("should split large program data into multiple transactions", () => {
      // Create test data larger than max chunk size (using 15000 bytes)
      const programData = new Uint8Array(15000).fill(1);
      const programId = SYSTEM_PROGRAM_ID;

      const txs = createDeployTxs(programData, programId);

      // Should create multiple transactions
      expect(txs.length).toBeGreaterThan(1);

      // Verify each transaction
      txs.forEach((tx) => {
        expect(tx.message.signers).toEqual([programId]);
        expect(tx.message.instructions).toHaveLength(1);

        const instruction = tx.message.instructions[0] as Instruction;
        expect(instruction).toBeDefined();
        expect(instruction.program_id).toBe(programId);
      });
    });

    it("should handle empty program data", () => {
      const programData = new Uint8Array(0);
      const programId = SYSTEM_PROGRAM_ID;

      const txs = createDeployTxs(programData, programId);

      expect(txs).toHaveLength(0);
    });
  });
});
