import { hex } from '@scure/base';
import { Instruction } from '../struct/instruction.js';
import { serialize as serializeAccountMeta } from './account.js';
import { AccountUtil } from '../index.js';

export const serialize = (instruction: Instruction): Uint8Array => {
  const serializedProgramId = instruction.program_id;
  const accountsCount = new Uint8Array([instruction.accounts.length]);
  const serializedAccounts = instruction.accounts.flatMap((account) =>
    Array.from(serializeAccountMeta(account)),
  );
  // Extend with data length (u64 in little-endian)
  const dataLengthBuffer = new ArrayBuffer(8);
  const dataLengthView = new DataView(dataLengthBuffer);

  dataLengthView.setBigUint64(0, BigInt(instruction.data.length), true);
  const littleEndianDataLength = new Uint8Array(dataLengthBuffer);

  // Convert serializedAccounts to Uint8Array and concatenate all arrays
  const serializedAccountsArray = new Uint8Array(serializedAccounts);
  const allArrays = [
    serializedProgramId,
    accountsCount,
    serializedAccountsArray,
    littleEndianDataLength,
    instruction.data,
  ] as const;
  return new Uint8Array(Buffer.concat(allArrays));
};

export const toHex = (instruction: Instruction) => {
  return {
    program_id: hex.encode(instruction.program_id),
    accounts: instruction.accounts.map(AccountUtil.toHex),
    data: hex.encode(instruction.data),
  };
};

export const toNumberArray = (instruction: Instruction) => {
  return {
    program_id: Array.from(instruction.program_id),
    accounts: instruction.accounts.map(AccountUtil.toNumberArray),
    data: Array.from(instruction.data),
  };
};
