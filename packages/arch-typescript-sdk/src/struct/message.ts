import { Schema } from 'borsh';
import { Instruction, InstructionSchema } from './instruction.js';
import { Pubkey, PubkeySchema } from './pubkey.js';

export interface Message {
  signers: Array<Pubkey>;
  instructions: Array<Instruction>;
}

export const MessageSchema: Schema = {
  struct: {
    signers: {
      array: {
        type: PubkeySchema,
      },
    },
    instructions: {
      array: {
        type: InstructionSchema,
      },
    },
  },
};
