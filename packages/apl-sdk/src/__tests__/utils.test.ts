import {
  createAccountInstruction,
  createAssignOwnershipInstruction,
  createWriteBytesInstruction,
  createExtendBytesInstruction,
  createKeypair,
  getTaprootAddress,
  getTaprootAddressFromPubkey,
  createSignerFromKeypair,
  readUInt64LE,
  writeBigUint64LE,
  xOnly,
  createMockSigner,
  waitForConfirmation,
  createAndSignTransaction,
  Keypair,
} from "../utils.js";
import { SYSTEM_PROGRAM_ID } from "../constants.js";
import { RpcConnection } from "@repo/arch-sdk";

describe("Utils", () => {
  describe("createAccountInstruction", () => {
    it("should create a valid account instruction", () => {
      const utxo = {
        txid: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        vout: 0,
      };
      const owner = new Uint8Array(32).fill(1);

      const instruction = createAccountInstruction(utxo, owner);

      expect(instruction.program_id).toEqual(SYSTEM_PROGRAM_ID);
      expect(instruction.accounts).toHaveLength(1);

      const account = instruction.accounts[0];
      expect(account).toBeDefined();
      if (!account) return;

      expect(account.pubkey).toEqual(owner);
      expect(account.is_signer).toBeTruthy();
      expect(account.is_writable).toBeTruthy();
      expect(instruction.data).toHaveLength(37); // 1 byte tag + 36 bytes utxo
      expect(instruction.data[0]).toBe(0); // Instruction tag
    });

    it("should create instruction with is_signer false", () => {
      const utxo = {
        txid: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        vout: 0,
      };
      const owner = new Uint8Array(32).fill(1);

      const instruction = createAccountInstruction(utxo, owner, false);

      const account = instruction.accounts[0];
      expect(account).toBeDefined();
      if (!account) return;

      expect(account.is_signer).toBeFalsy();
    });
  });

  describe("createAssignOwnershipInstruction", () => {
    it("should create a valid assign ownership instruction", () => {
      const from = new Uint8Array(32).fill(1);
      const to = new Uint8Array(32).fill(2);

      const instruction = createAssignOwnershipInstruction(from, to);

      expect(instruction.program_id).toEqual(SYSTEM_PROGRAM_ID);
      expect(instruction.accounts).toHaveLength(1);

      const account = instruction.accounts[0];
      expect(account).toBeDefined();
      if (!account) return;

      expect(account.pubkey).toEqual(from);
      expect(account.is_signer).toBeTruthy();
      expect(account.is_writable).toBeTruthy();
      expect(instruction.data[0]).toBe(3); // Instruction tag
      expect(instruction.data.slice(1)).toEqual(to); // Owner pubkey
    });
  });

  describe("createWriteBytesInstruction", () => {
    it("should create a valid write bytes instruction", () => {
      const pubkey = new Uint8Array(32).fill(1);
      const offset = 10;
      const data = new Uint8Array([1, 2, 3, 4]);

      const instruction = createWriteBytesInstruction(pubkey, offset, data);

      expect(instruction.program_id).toEqual(SYSTEM_PROGRAM_ID);
      expect(instruction.accounts).toHaveLength(1);

      const account = instruction.accounts[0];
      expect(account).toBeDefined();
      if (!account) return;

      expect(account.pubkey).toEqual(pubkey);
      expect(account.is_signer).toBeTruthy();
      expect(account.is_writable).toBeTruthy();

      // Check instruction data structure
      expect(instruction.data[0]).toBe(1); // Instruction tag

      // Create DataView with proper type assertions
      const view = new DataView(
        instruction.data.buffer,
        instruction.data.byteOffset
      );
      // Check offset bytes (4 bytes, little-endian)
      expect(view.getUint32(1, true)).toBe(offset);
      // Check length bytes (4 bytes, little-endian)
      expect(view.getUint32(5, true)).toBe(data.length);
      // Check data bytes
      expect(instruction.data.slice(9, 9 + data.length)).toEqual(data);
    });
  });

  describe("createExtendBytesInstruction", () => {
    it("should create a valid extend bytes instruction", () => {
      const pubkey = new Uint8Array(32).fill(1);
      const data = new Uint8Array([1, 2, 3, 4]);

      const instruction = createExtendBytesInstruction(pubkey, data);

      expect(instruction.program_id).toEqual(SYSTEM_PROGRAM_ID);
      expect(instruction.accounts).toHaveLength(1);

      const account = instruction.accounts[0];
      expect(account).toBeDefined();
      if (!account) return;

      expect(account.pubkey).toEqual(pubkey);
      expect(account.is_signer).toBeTruthy();
      expect(account.is_writable).toBeTruthy();

      // Check instruction data structure
      expect(instruction.data[0]).toBe(1); // Instruction tag
      // Check data bytes
      expect(instruction.data.slice(1)).toEqual(data);
    });
  });

  describe("createKeypair", () => {
    it("should create a valid keypair", () => {
      const keypair = createKeypair();

      expect(keypair.publicKey).toBeInstanceOf(Uint8Array);
      expect(keypair.secretKey).toBeInstanceOf(Uint8Array);
      expect(keypair.publicKey.length).toBe(32);
      expect(keypair.secretKey.length).toBe(32);
    });
  });

  describe("Taproot address functions", () => {
    let keypair: Keypair;

    beforeEach(() => {
      keypair = createKeypair();
    });

    it("should get taproot address from keypair", () => {
      const address = getTaprootAddress(keypair);
      expect(address).toMatch(/^bc1p[a-zA-Z0-9]+$/);
    });

    it("should get taproot address from pubkey", () => {
      const address = getTaprootAddressFromPubkey(keypair.publicKey);
      expect(address).toMatch(/^bc1p[a-zA-Z0-9]+$/);
    });
  });

  describe("readUInt64LE", () => {
    it("should correctly read uint64 from buffer", () => {
      const buffer = Buffer.alloc(8);
      const value = BigInt("123456789");
      buffer.writeBigUInt64LE(value);

      const result = readUInt64LE(buffer, 0);
      expect(result).toBe(value);
    });

    it("should work with Uint8Array", () => {
      const buffer = new Uint8Array(8);
      const view = new DataView(buffer.buffer);
      const value = BigInt("123456789");
      view.setBigUint64(0, value, true);

      const result = readUInt64LE(buffer, 0);
      expect(result).toBe(value);
    });
  });

  describe("writeBigUint64LE", () => {
    it("should write uint64 to buffer", () => {
      const buffer = Buffer.alloc(8);
      const value = BigInt("123456789");

      writeBigUint64LE(buffer, value);

      const result = buffer.readBigUInt64LE();
      expect(result).toBe(value);
    });

    it("should throw for non-BigInt values", () => {
      const buffer = Buffer.alloc(8);
      // @ts-expect-error Testing invalid input
      expect(() => writeBigUint64LE(buffer, 123456789)).toThrow();
    });

    it("should throw for out of bounds offset", () => {
      const buffer = Buffer.alloc(8);
      const value = BigInt("123456789");

      expect(() => writeBigUint64LE(buffer, value, -1)).toThrow();
      expect(() => writeBigUint64LE(buffer, value, 8)).toThrow();
    });
  });

  describe("xOnly", () => {
    it("should handle 66-char public key", () => {
      const pubkey = "02" + "a".repeat(64);
      expect(xOnly(pubkey)).toBe("a".repeat(64));
    });

    it("should handle 64-char public key", () => {
      const pubkey = "a".repeat(64);
      expect(xOnly(pubkey)).toBe(pubkey);
    });

    it("should throw for invalid length", () => {
      expect(() => xOnly("a".repeat(63))).toThrow();
      expect(() => xOnly("a".repeat(65))).toThrow();
    });
  });

  describe("createMockSigner", () => {
    it("should return empty signature", async () => {
      const signer = createMockSigner();
      const signature = await signer("test message");

      // Should be base64 encoded string of 64 zero bytes
      expect(signature).toBe(
        Buffer.from(new Uint8Array(64)).toString("base64")
      );
    });
  });

  describe("waitForConfirmation", () => {
    it("should resolve when transaction is processed", async () => {
      const mockRpc = {
        getProcessedTransaction: jest
          .fn()
          .mockResolvedValueOnce({ status: "Pending" })
          .mockResolvedValueOnce({ status: "Processed" }),
      } as unknown as RpcConnection;

      await expect(
        waitForConfirmation(mockRpc, "txid", { timeout: 100, maxAttempts: 2 })
      ).resolves.toBeUndefined();

      expect(mockRpc.getProcessedTransaction).toHaveBeenCalledTimes(2);
    });

    it("should throw on transaction failure", async () => {
      const mockRpc = {
        getProcessedTransaction: jest
          .fn()
          .mockResolvedValue({ status: { Failed: "error message" } }),
      } as unknown as RpcConnection;

      await expect(
        waitForConfirmation(mockRpc, "txid", { timeout: 100, maxAttempts: 1 })
      ).rejects.toThrow("Transaction failed: error message");
    });

    it("should throw after max attempts", async () => {
      const mockRpc = {
        getProcessedTransaction: jest
          .fn()
          .mockResolvedValue({ status: "Pending" }),
      } as unknown as RpcConnection;

      await expect(
        waitForConfirmation(mockRpc, "txid", { timeout: 100, maxAttempts: 2 })
      ).rejects.toThrow("Transaction not confirmed after 2 attempts");
    });
  });

  describe("createAndSignTransaction", () => {
    it("should create transaction with no signers", async () => {
      const instruction = {
        program_id: new Uint8Array(32),
        accounts: [],
        data: new Uint8Array(),
      };

      const mockSigner = createMockSigner();
      const tx = await createAndSignTransaction([], instruction, mockSigner);

      expect(tx.version).toBe(0);
      expect(tx.signatures).toHaveLength(0);
      expect(tx.message.instructions).toHaveLength(1);
    });

    it("should create transaction with signers", async () => {
      const signer = new Uint8Array(32).fill(1);
      const instruction = {
        program_id: new Uint8Array(32),
        accounts: [{ pubkey: signer, is_signer: true, is_writable: true }],
        data: new Uint8Array(),
      };

      const mockSigner = createMockSigner();
      const tx = await createAndSignTransaction(
        [signer],
        instruction,
        mockSigner
      );

      expect(tx.version).toBe(0);
      expect(tx.signatures).toHaveLength(1);
      expect(tx.message.signers).toEqual([signer]);
      expect(tx.message.instructions).toHaveLength(1);
    });
  });

  describe("createSignerFromKeypair", () => {
    it("should create a valid signer callback", async () => {
      const keypair = createKeypair();
      const signer = createSignerFromKeypair(keypair);

      const signature = await signer("test message");
      expect(typeof signature).toBe("string");
      expect(signature.length).toBeGreaterThan(0);
    });
  });
});
