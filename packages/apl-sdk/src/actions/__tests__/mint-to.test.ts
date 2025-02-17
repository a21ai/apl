import { mintToTx } from "../../actions/mint-to.js";
import { createMockSigner } from "../../utils.js";
import { TOKEN_PROGRAM_ID } from "../../constants.js";

describe("mint-to", () => {
  it("should create mint-to transaction with provided nonce", async () => {
    const mint = new Uint8Array(32).fill(1);
    const recipient = new Uint8Array(32).fill(2);
    const mintAuthority = new Uint8Array(32).fill(3);
    const amount = BigInt(1000000);
    const nonce = 12345;
    const mockSigner = createMockSigner();

    const tx = await mintToTx(
      mint,
      recipient,
      amount,
      mintAuthority,
      mockSigner,
      nonce
    );

    // Check transaction structure
    expect(tx.version).toBe(0);
    expect(tx.signatures).toHaveLength(1);
    expect(tx.message.signers).toEqual([mintAuthority]);
    expect(tx.message.instructions).toHaveLength(1);

    // Check instruction
    const instruction = tx.message.instructions[0];
    expect(instruction).toBeDefined();
    expect(instruction!.program_id).toEqual(TOKEN_PROGRAM_ID);

    // Check accounts
    expect(instruction!.accounts).toHaveLength(3);

    const [mintAccount, recipientAccount, authorityAccount] =
      instruction!.accounts;
    expect(mintAccount).toBeDefined();
    expect(recipientAccount).toBeDefined();
    expect(authorityAccount).toBeDefined();

    expect(mintAccount!.pubkey).toEqual(mint);
    expect(mintAccount!.is_signer).toBe(false);
    expect(mintAccount!.is_writable).toBe(true);

    expect(recipientAccount!.pubkey).toEqual(recipient);
    expect(recipientAccount!.is_signer).toBe(false);
    expect(recipientAccount!.is_writable).toBe(true);

    expect(authorityAccount!.pubkey).toEqual(mintAuthority);
    expect(authorityAccount!.is_signer).toBe(true);
    expect(authorityAccount!.is_writable).toBe(false);

    // Check instruction data includes nonce
    const nonceBuf = Buffer.alloc(4);
    nonceBuf.writeUInt32LE(nonce, 0);
    expect(instruction!.data.slice(-4)).toEqual(nonceBuf);
  });

  it("should create mint-to transaction with random nonce when not provided", async () => {
    const mint = new Uint8Array(32).fill(1);
    const recipient = new Uint8Array(32).fill(2);
    const mintAuthority = new Uint8Array(32).fill(3);
    const amount = BigInt(1000000);
    const mockSigner = createMockSigner();

    const tx = await mintToTx(
      mint,
      recipient,
      amount,
      mintAuthority,
      mockSigner
    );

    // Check basic transaction structure
    expect(tx.version).toBe(0);
    expect(tx.signatures).toHaveLength(1);
    expect(tx.message.signers).toEqual([mintAuthority]);
    expect(tx.message.instructions).toHaveLength(1);

    // Verify nonce is present and is a valid uint32
    const instruction = tx.message.instructions[0];
    expect(instruction).toBeDefined();
    const nonce = instruction!.data.slice(-4);
    expect(nonce.length).toBe(4);
    expect(() => Buffer.from(nonce).readUInt32LE(0)).not.toThrow();
  });
});
