import { initializeMintTx } from "../../actions/initialize-mint.js";
import { createKeypair, createMockSigner } from "../../utils.js";
import { TOKEN_PROGRAM_ID } from "../../constants.js";

describe("initialize-mint", () => {
  const utxo = {
    txid: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    vout: 0,
  };

  it("should create initialize mint transaction with all authorities", async () => {
    const mintKeypair = createKeypair();
    const mintAuthority = new Uint8Array(32).fill(1);
    const freezeAuthority = new Uint8Array(32).fill(2);
    const decimals = 6;
    const mockSigner = createMockSigner();

    const tx = await initializeMintTx(
      mintKeypair,
      utxo,
      decimals,
      mintAuthority,
      freezeAuthority,
      mockSigner
    );

    // Check transaction structure
    expect(tx.version).toBe(0);
    expect(tx.signatures).toHaveLength(1);
    expect(tx.message.signers).toEqual([mintKeypair.publicKey]);
    expect(tx.message.instructions).toHaveLength(4);

    // Check instructions
    const [accountInst, writeInst, assignInst, tokenInst] =
      tx.message.instructions;
    expect(accountInst).toBeDefined();
    expect(writeInst).toBeDefined();
    expect(assignInst).toBeDefined();
    expect(tokenInst).toBeDefined();

    // Check account instruction
    expect(accountInst!.program_id).toBeDefined();
    expect(accountInst!.accounts[0]?.pubkey).toEqual(mintKeypair.publicKey);
    expect(accountInst!.accounts[0]?.is_signer).toBe(true);
    expect(accountInst!.accounts[0]?.is_writable).toBe(true);

    // Check write bytes instruction
    expect(writeInst!.program_id).toBeDefined();
    expect(writeInst!.accounts[0]?.pubkey).toEqual(mintKeypair.publicKey);
    expect(writeInst!.accounts[0]?.is_signer).toBe(true);
    expect(writeInst!.accounts[0]?.is_writable).toBe(true);

    // Check assign ownership instruction
    expect(assignInst!.program_id).toBeDefined();
    expect(assignInst!.accounts[0]?.pubkey).toEqual(mintKeypair.publicKey);
    expect(assignInst!.accounts[0]?.is_signer).toBe(true);
    expect(assignInst!.accounts[0]?.is_writable).toBe(true);
    expect(assignInst!.data.slice(1)).toEqual(TOKEN_PROGRAM_ID);

    // Check token instruction
    expect(tokenInst!.program_id).toEqual(TOKEN_PROGRAM_ID);
    expect(tokenInst!.accounts[0]?.pubkey).toEqual(mintKeypair.publicKey);
    expect(tokenInst!.accounts[0]?.is_signer).toBe(true);
    expect(tokenInst!.accounts[0]?.is_writable).toBe(true);
  });

  it("should create initialize mint transaction without freeze authority", async () => {
    const mintKeypair = createKeypair();
    const mintAuthority = new Uint8Array(32).fill(1);
    const decimals = 9;
    const mockSigner = createMockSigner();

    const tx = await initializeMintTx(
      mintKeypair,
      utxo,
      decimals,
      mintAuthority,
      null,
      mockSigner
    );

    expect(tx.version).toBe(0);
    expect(tx.signatures).toHaveLength(1);
    expect(tx.message.signers).toEqual([mintKeypair.publicKey]);
    expect(tx.message.instructions).toHaveLength(4);

    // Check token instruction specifically for null freeze authority
    const tokenInst = tx.message.instructions[3];
    expect(tokenInst).toBeDefined();
    expect(tokenInst!.program_id).toEqual(TOKEN_PROGRAM_ID);
    expect(tokenInst!.accounts[0]?.pubkey).toEqual(mintKeypair.publicKey);
  });
});
