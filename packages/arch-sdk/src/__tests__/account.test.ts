import { it, describe, expect } from 'vitest';
import { systemProgram } from '../serde/pubkey.js';
import { Instruction } from '../struct/instruction.js';
import { AccountMeta } from '../struct/account.js';
import { serialize } from '../serde/account.js';

describe('assert that account struct serializes as expected', () => {
  it('checks borsh serialization matches', () => {
    // instruction: new extend bytes instruction:
    const borshSerializedOutput = Uint8Array.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 1, 1, 1,
    ]);

    const testAccount: AccountMeta = {
      pubkey: systemProgram(),
      is_signer: true,
      is_writable: true,
    };

    // number array for easier comparison
    const serialized = Array.from(serialize(testAccount));
    const expected = Array.from(borshSerializedOutput);

    expect(serialized).toEqual(expected);
  });
});
