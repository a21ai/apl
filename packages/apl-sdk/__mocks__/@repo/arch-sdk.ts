export type Pubkey = Uint8Array;
export type UtxoMetaData = {
  txid: string;
  vout: number;
};
export type Instruction = {
  program_id: Pubkey;
  accounts: {
    pubkey: Pubkey;
    is_signer: boolean;
    is_writable: boolean;
  }[];
  data: Uint8Array;
};
export type RuntimeTransaction = {
  instructions: Instruction[];
};
