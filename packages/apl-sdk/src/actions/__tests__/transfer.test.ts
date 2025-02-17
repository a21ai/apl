import { transferTx } from "../../actions/transfer.js";
import { createMockSigner } from "../../utils.js";
import { TOKEN_PROGRAM_ID } from "../../constants.js";

describe("transfer", () => {
  it("should create transfer transaction with provided nonce", async () => {
    const source = new Uint8Array(32).fill(1);
    const mint = new Uint8Array(32).fill(2);
    const destination = new Uint8Array(32).fill(3);
    const owner = new Uint8Array(32).fill(4);
    const amount = BigInt(1000000);
    const decimals = 6;
    const nonce = 12345;
    const mockSigner = createMockSigner();

    const tx = await transferTx(
      source,
      mint,
      destination,
      owner,
      amount,
      decimals,
      mockSigner,
      nonce
    );

    // Check transaction structure
    expect(tx.version).toBe(0);
    expect(tx.signatures).toHaveLength(1);
    expect(tx.message.signers).toEqual([owner]);
    expect(tx.message.instructions).toHaveLength(1);

    // Check instruction
    const instruction = tx.message.instructions[0];
    expect(instruction).toBeDefined();
    expect(instruction!.program_id).toEqual(TOKEN_PROGRAM_ID);

    // Check accounts
    expect(instruction!.accounts).toHaveLength(4);

    const [sourceAccount, mintAccount, destAccount, ownerAccount] =
      instruction!.accounts;
    expect(sourceAccount).toBeDefined();
    expect(mintAccount).toBeDefined();
    expect(destAccount).toBeDefined();
    expect(ownerAccount).toBeDefined();

    expect(sourceAccount!.pubkey).toEqual(source);
    expect(sourceAccount!.is_signer).toBe(false);
    expect(sourceAccount!.is_writable).toBe(true);

    expect(mintAccount!.pubkey).toEqual(mint);
    expect(mintAccount!.is_signer).toBe(false);
    expect(mintAccount!.is_writable).toBe(false);

    expect(destAccount!.pubkey).toEqual(destination);
    expect(destAccount!.is_signer).toBe(false);
    expect(destAccount!.is_writable).toBe(true);

    expect(ownerAccount!.pubkey).toEqual(owner);
    expect(ownerAccount!.is_signer).toBe(true);
    expect(ownerAccount!.is_writable).toBe(false);

    // Check instruction data includes nonce
    const nonceBuf = Buffer.alloc(4);
    nonceBuf.writeUInt32LE(nonce, 0);
    expect(instruction!.data.slice(-4)).toEqual(nonceBuf);
  });

  it("should create transfer transaction with random nonce when not provided", async () => {
    const source = new Uint8Array(32).fill(1);
    const mint = new Uint8Array(32).fill(2);
    const destination = new Uint8Array(32).fill(3);
    const owner = new Uint8Array(32).fill(4);
    const amount = BigInt(1000000);
    const decimals = 6;
    const mockSigner = createMockSigner();

    const tx = await transferTx(
      source,
      mint,
      destination,
      owner,
      amount,
      decimals,
      mockSigner
    );

    // Check basic transaction structure
    expect(tx.version).toBe(0);
    expect(tx.signatures).toHaveLength(1);
    expect(tx.message.signers).toEqual([owner]);
    expect(tx.message.instructions).toHaveLength(1);

    // Verify nonce is present and is a valid uint32
    const instruction = tx.message.instructions[0];
    expect(instruction).toBeDefined();
    const nonce = instruction!.data.slice(-4);
    expect(nonce.length).toBe(4);
    expect(() => Buffer.from(nonce).readUInt32LE(0)).not.toThrow();
  });
});
