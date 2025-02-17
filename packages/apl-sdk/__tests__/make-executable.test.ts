import { Pubkey, RuntimeTransaction, Instruction } from "@repo/arch-sdk";
import { createExecutableTx } from "../src/actions/make-executable";
import { SYSTEM_PROGRAM_ID } from "../src/constants";

describe("make-executable", () => {
  describe("createExecutableTx", () => {
    it("should create a valid transaction to make program executable", async () => {
      const programId = SYSTEM_PROGRAM_ID;
      const mockSignature = new Uint8Array(64).fill(1);

      // Mock signer callback
      const mockSigner = jest.fn().mockResolvedValue(mockSignature);

      const tx = await createExecutableTx(programId, mockSigner);

      // Verify transaction structure
      expect(tx.version).toBe(0);
      expect(tx.signatures).toHaveLength(1);
      expect(tx.signatures[0]).toEqual(mockSignature);

      // Verify message structure
      expect(tx.message.signers).toEqual([programId]);
      expect(tx.message.instructions).toHaveLength(1);

      // Verify instruction
      const instruction = tx.message.instructions[0] as Instruction;
      expect(instruction).toBeDefined();
      expect(instruction.program_id).toBe(programId);
      expect(instruction.accounts).toBeDefined();
      expect(instruction.data).toBeDefined();
    });

    it("should call signer with correct data", async () => {
      const programId = SYSTEM_PROGRAM_ID;
      const mockSignature = new Uint8Array(64).fill(1);
      const mockSigner = jest.fn().mockResolvedValue(mockSignature);

      await createExecutableTx(programId, mockSigner);

      // Verify signer was called
      expect(mockSigner).toHaveBeenCalledTimes(1);

      // Verify signer was called with message hash
      const signerCall = mockSigner.mock.calls[0];
      expect(signerCall).toHaveLength(1);
      expect(typeof signerCall[0]).toBe("string");
      expect(signerCall[0]).toMatch(/^[a-f0-9]{64}$/); // 32-byte hex string
    });

    it("should throw error if signer fails", async () => {
      const programId = SYSTEM_PROGRAM_ID;
      const mockSigner = jest
        .fn()
        .mockRejectedValue(new Error("Signing failed"));

      await expect(createExecutableTx(programId, mockSigner)).rejects.toThrow(
        "Signing failed"
      );
    });
  });
});
