import { Pubkey, ArchConnection } from "@saturnbtcio/arch-sdk";
import { Keypair } from "@solana/web3.js";
import Borsh from "borsh";

export const mintTo = (mint: Pubkey, to: Pubkey, amount: number) => {
  console.log(mint, to, amount);
};

export const createMint = (
  connection: typeof ArchConnection,
  mint_authority: Pubkey,
  freeze_authority: Pubkey,
  decimals: number
) => {
  console.log(mint_authority, freeze_authority, decimals);
};

export const getOrCreateAssociatedTokenAccount = (
  connection: typeof ArchConnection,
  payer: Keypair,
  mint: Pubkey,
  owner: Pubkey,
  enablePDAOwner: boolean
) => {
  console.log(connection, payer, mint, owner, enablePDAOwner);
};
