import { AccountInfoResult } from '../struct/account.js';
import { Block } from '../struct/block.js';
import { ProcessedTransaction } from '../struct/processed-transaction.js';
import { ProgramAccount } from '../struct/program-account.js';
import { Pubkey } from '../struct/pubkey.js';
import { RuntimeTransaction } from '../struct/runtime-transaction.js';

export interface Provider {
  sendTransaction: (transaction: RuntimeTransaction) => Promise<string>;
  sendTransactions: (transactions: RuntimeTransaction[]) => Promise<string[]>;
  readAccountInfo: (pubkey: Pubkey) => Promise<AccountInfoResult>;
  getAccountAddress: (pubkey: Pubkey) => Promise<string>;
  getBestBlockHash: () => Promise<string>;
  getBlock: (blockHash: string) => Promise<Block | undefined>;
  getBlockCount: () => Promise<number>;
  getBlockHash: (blockHeight: number) => Promise<string>;
  getProgramAccounts: (programId: Pubkey) => Promise<ProgramAccount[]>;
  getProcessedTransaction: (txid: string) => Promise<ProcessedTransaction | undefined>;
}
