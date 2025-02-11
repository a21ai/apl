import type {
  Pubkey,
  RuntimeTransaction,
  UtxoMetaData,
  Instruction,
} from "@repo/arch-sdk";
import { createAccountInstruction, createAssignOwnershipInstruction, createWriteBytesInstruction, SignerCallback, Keypair } from "../utils.js";
import { AMM_PROGRAM_ID } from "../constants.js";
import * as AmmInstructionUtil from "../serde/amm-instruction.js";
import * as PoolUtil from "../serde/pool.js";
import { createAndSignTransaction } from "../utils.js";

export async function initializePoolTx(
  poolKeypair: Keypair,
  tokenAMint: Pubkey,
  tokenBMint: Pubkey,
  lpMint: Pubkey,
  tokenAVault: Pubkey,
  tokenBVault: Pubkey,
  authority: Pubkey,
  feeNumerator: number,
  feeDenominator: number,
  utxo: UtxoMetaData,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  // Create account for pool state
  const accountInstruction = createAccountInstruction(
    utxo,
    poolKeypair.publicKey
  );

  // Initialize pool state
  const pool = {
    tokenA: tokenAMint,
    tokenB: tokenBMint,
    lpMint,
    tokenAVault,
    tokenBVault,
    feeNumerator,
    feeDenominator,
    isInitialized: false,
  };

  // Write pool state
  const writeBytesInstruction = createWriteBytesInstruction(
    poolKeypair.publicKey,
    0,
    PoolUtil.serialize(pool)
  );

  // Assign ownership to AMM program
  const assignInstruction = createAssignOwnershipInstruction(
    poolKeypair.publicKey,
    AMM_PROGRAM_ID
  );

  // Create initialize pool instruction
  const initializeInstruction: Instruction = {
    program_id: AMM_PROGRAM_ID,
    accounts: [
      { pubkey: poolKeypair.publicKey, is_signer: true, is_writable: true },
      { pubkey: tokenAMint, is_signer: false, is_writable: false },
      { pubkey: tokenBMint, is_signer: false, is_writable: false },
      { pubkey: lpMint, is_signer: false, is_writable: true },
      { pubkey: tokenAVault, is_signer: false, is_writable: true },
      { pubkey: tokenBVault, is_signer: false, is_writable: true },
      { pubkey: authority, is_signer: true, is_writable: false },
    ],
    data: AmmInstructionUtil.serialize(AmmInstructionUtil.AmmInstruction.InitializePool, {
      instruction: AmmInstructionUtil.AmmInstruction.InitializePool,
      feeNumerator,
      feeDenominator,
    }),
  };

  return createAndSignTransaction(
    [poolKeypair.publicKey, authority],
    [
      accountInstruction,
      writeBytesInstruction,
      assignInstruction,
      initializeInstruction,
    ],
    signer
  );
}

export async function addLiquidityTx(
  pool: Pubkey,
  tokenAVault: Pubkey,
  tokenBVault: Pubkey,
  lpMint: Pubkey,
  userTokenA: Pubkey,
  userTokenB: Pubkey,
  userLp: Pubkey,
  authority: Pubkey,
  tokenAAmount: bigint,
  tokenBAmount: bigint,
  minLpAmount: bigint,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const instruction: Instruction = {
    program_id: AMM_PROGRAM_ID,
    accounts: [
      { pubkey: pool, is_signer: false, is_writable: true },
      { pubkey: tokenAVault, is_signer: false, is_writable: true },
      { pubkey: tokenBVault, is_signer: false, is_writable: true },
      { pubkey: lpMint, is_signer: false, is_writable: true },
      { pubkey: userTokenA, is_signer: false, is_writable: true },
      { pubkey: userTokenB, is_signer: false, is_writable: true },
      { pubkey: userLp, is_signer: false, is_writable: true },
      { pubkey: authority, is_signer: true, is_writable: false },
    ],
    data: AmmInstructionUtil.serialize(AmmInstructionUtil.AmmInstruction.AddLiquidity, {
      instruction: AmmInstructionUtil.AmmInstruction.AddLiquidity,
      tokenAAmount,
      tokenBAmount,
      minLpAmount,
    }),
  };

  return createAndSignTransaction([authority], instruction, signer);
}

export async function removeLiquidityTx(
  pool: Pubkey,
  tokenAVault: Pubkey,
  tokenBVault: Pubkey,
  lpMint: Pubkey,
  userTokenA: Pubkey,
  userTokenB: Pubkey,
  userLp: Pubkey,
  authority: Pubkey,
  lpAmount: bigint,
  minTokenAAmount: bigint,
  minTokenBAmount: bigint,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const instruction: Instruction = {
    program_id: AMM_PROGRAM_ID,
    accounts: [
      { pubkey: pool, is_signer: false, is_writable: true },
      { pubkey: tokenAVault, is_signer: false, is_writable: true },
      { pubkey: tokenBVault, is_signer: false, is_writable: true },
      { pubkey: lpMint, is_signer: false, is_writable: true },
      { pubkey: userTokenA, is_signer: false, is_writable: true },
      { pubkey: userTokenB, is_signer: false, is_writable: true },
      { pubkey: userLp, is_signer: false, is_writable: true },
      { pubkey: authority, is_signer: true, is_writable: false },
    ],
    data: AmmInstructionUtil.serialize(AmmInstructionUtil.AmmInstruction.RemoveLiquidity, {
      instruction: AmmInstructionUtil.AmmInstruction.RemoveLiquidity,
      lpAmount,
      minTokenAAmount,
      minTokenBAmount,
    }),
  };

  return createAndSignTransaction([authority], instruction, signer);
}

export async function swapTx(
  pool: Pubkey,
  inputVault: Pubkey,
  outputVault: Pubkey,
  userInput: Pubkey,
  userOutput: Pubkey,
  authority: Pubkey,
  amountIn: bigint,
  minAmountOut: bigint,
  signer: SignerCallback
): Promise<RuntimeTransaction> {
  const instruction: Instruction = {
    program_id: AMM_PROGRAM_ID,
    accounts: [
      { pubkey: pool, is_signer: false, is_writable: true },
      { pubkey: inputVault, is_signer: false, is_writable: true },
      { pubkey: outputVault, is_signer: false, is_writable: true },
      { pubkey: userInput, is_signer: false, is_writable: true },
      { pubkey: userOutput, is_signer: false, is_writable: true },
      { pubkey: authority, is_signer: true, is_writable: false },
    ],
    data: AmmInstructionUtil.serialize(AmmInstructionUtil.AmmInstruction.Swap, {
      instruction: AmmInstructionUtil.AmmInstruction.Swap,
      amountIn,
      minAmountOut,
    }),
  };

  return createAndSignTransaction([authority], instruction, signer);
}
