import { Pubkey } from './pubkey.js';
import { AccountInfoResult } from './account.js';

export interface AccountFilter {
  memcmp?: {
    offset: number;
    bytes: string; // hex-encoded bytes
  };
  DataSize?: number;
}
export interface ProgramAccount {
  pubkey: Pubkey;
  account: AccountInfoResult;
}
