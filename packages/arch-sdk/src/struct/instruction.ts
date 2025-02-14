import { Schema } from 'borsh';
import { AccountMeta, AccountMetaSchema } from './account.js';
import { Pubkey, PubkeySchema } from './pubkey.js';

export interface Instruction {
  program_id: Pubkey;
  accounts: Array<AccountMeta>;
  data: Uint8Array;
}

export const InstructionSchema: Schema = {
  struct: {
    program_id: PubkeySchema,
    accounts: {
      array: {
        type: AccountMetaSchema,
      },
    },
    data: {
      array: {
        type: 'u8',
      },
    },
  },
};
