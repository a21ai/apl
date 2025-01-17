import { hex } from '@scure/base';
import { Instruction } from '../struct/instruction.js';
import { serialize as serializeAccountMeta } from './account.js';
import { AccountUtil } from '../index.js';

export const serialize = (instruction: Instruction): Uint8Array => {
  const serializedProgramId = instruction.program_id;
  const accountsCount = new Uint8Array([instruction.accounts.length]);
  const serializedAccounts = Buffer.concat(
    instruction.accounts.map((account) => Buffer.from(serializeAccountMeta(account)))
  );
  
  // Extend with data length (u64 in little-endian)
  const dataLengthBuffer = Buffer.alloc(8);
  dataLengthBuffer.writeBigUInt64LE(BigInt(instruction.data.length));

  // Concatenate all arrays using Buffer for proper Uint8Array handling
  const allArrays = [
    Buffer.from(serializedProgramId),
    Buffer.from(accountsCount),
    serializedAccounts,
    dataLengthBuffer,
    Buffer.from(instruction.data)
  ];
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
