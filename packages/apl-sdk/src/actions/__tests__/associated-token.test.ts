import { associatedTokenTx } from "../../actions/associated-token.js";
import { createMockSigner } from "../../utils.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
} from "../../constants.js";

describe("associated-token", () => {
  const utxo = {
    txid: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    vout: 0,
  };

  it("should create associated token transaction", async () => {
    const associatedToken = new Uint8Array(32).fill(1);
    const owner = new Uint8Array(32).fill(2);
    const mint = new Uint8Array(32).fill(3);
    const mockSigner = createMockSigner();

    const tx = await associatedTokenTx(
      utxo,
      associatedToken,
      owner,
      mint,
      mockSigner
    );

    // Check transaction structure
    expect(tx.version).toBe(0);
    expect(tx.signatures).toHaveLength(0);
    expect(tx.message.signers).toEqual([]);
    expect(tx.message.instructions).toHaveLength(1);

    // Check instruction
    const instruction = tx.message.instructions[0];
    expect(instruction).toBeDefined();
    expect(instruction!.program_id).toEqual(ASSOCIATED_TOKEN_PROGRAM_ID);

    // Check accounts
    expect(instruction!.accounts).toHaveLength(5);

    const [
      associatedTokenAccount,
      ownerAccount,
      mintAccount,
      systemAccount,
      tokenAccount,
    ] = instruction!.accounts;

    expect(associatedTokenAccount).toBeDefined();
    expect(ownerAccount).toBeDefined();
    expect(mintAccount).toBeDefined();
    expect(systemAccount).toBeDefined();
    expect(tokenAccount).toBeDefined();

    expect(associatedTokenAccount!.pubkey).toEqual(associatedToken);
    expect(associatedTokenAccount!.is_signer).toBe(false);
    expect(associatedTokenAccount!.is_writable).toBe(true);

    expect(ownerAccount!.pubkey).toEqual(owner);
    expect(ownerAccount!.is_signer).toBe(false);
    expect(ownerAccount!.is_writable).toBe(false);

    expect(mintAccount!.pubkey).toEqual(mint);
    expect(mintAccount!.is_signer).toBe(false);
    expect(mintAccount!.is_writable).toBe(false);

    expect(systemAccount!.pubkey).toEqual(SYSTEM_PROGRAM_ID);
    expect(systemAccount!.is_signer).toBe(false);
    expect(systemAccount!.is_writable).toBe(false);

    expect(tokenAccount!.pubkey).toEqual(TOKEN_PROGRAM_ID);
    expect(tokenAccount!.is_signer).toBe(false);
    expect(tokenAccount!.is_writable).toBe(false);

    // Check instruction data structure
    expect(instruction!.data.length).toBe(68); // 36 bytes for UTXO + 32 bytes for SYSTEM_PROGRAM_ID
    expect(instruction!.data.slice(36)).toEqual(SYSTEM_PROGRAM_ID);
  });
});
