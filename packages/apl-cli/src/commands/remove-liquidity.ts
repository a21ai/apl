import { Command } from "commander";
import {
  loadKeypair,
  handleError,
  createRpcConnection,
} from "../utils.js";
import {
  removeLiquidityTx,
  createSignerFromKeypair,
  waitForConfirmation,
} from "@repo/apl-sdk";
import { PubkeyUtil } from "@repo/apl-sdk";

export default function removeLiquidityCommand(program: Command) {
  program
    .command("remove-liquidity")
    .description("Remove liquidity from an AMM pool")
    .requiredOption("--pool <pubkey>", "Pool address")
    .requiredOption("--token-a-vault <pubkey>", "Token A vault address")
    .requiredOption("--token-b-vault <pubkey>", "Token B vault address")
    .requiredOption("--lp-mint <pubkey>", "LP token mint address")
    .requiredOption("--user-token-a <pubkey>", "User's token A account")
    .requiredOption("--user-token-b <pubkey>", "User's token B account")
    .requiredOption("--user-lp <pubkey>", "User's LP token account")
    .requiredOption("--lp-amount <number>", "Amount of LP tokens to burn")
    .option("--min-token-a-amount <number>", "Minimum token A to receive", "0")
    .option("--min-token-b-amount <number>", "Minimum token B to receive", "0")
    .action(async (options) => {
      try {
        const rpcConnection = createRpcConnection();
        const walletKeypair = loadKeypair();

        const pool = PubkeyUtil.fromHex(options.pool);
        const tokenAVault = PubkeyUtil.fromHex(options.tokenAVault);
        const tokenBVault = PubkeyUtil.fromHex(options.tokenBVault);
        const lpMint = PubkeyUtil.fromHex(options.lpMint);
        const userTokenA = PubkeyUtil.fromHex(options.userTokenA);
        const userTokenB = PubkeyUtil.fromHex(options.userTokenB);
        const userLp = PubkeyUtil.fromHex(options.userLp);
        const lpAmount = BigInt(options.lpAmount);
        const minTokenAAmount = BigInt(options.minTokenAAmount);
        const minTokenBAmount = BigInt(options.minTokenBAmount);

        console.log("Removing liquidity from AMM pool...");
        console.log(`Pool: ${options.pool}`);
        console.log(`LP Amount: ${lpAmount}`);
        console.log(`Minimum Token A: ${minTokenAAmount}`);
        console.log(`Minimum Token B: ${minTokenBAmount}`);

        // Create and send remove liquidity transaction
        const signer = createSignerFromKeypair(walletKeypair);

        const tx = await removeLiquidityTx(
          pool,
          tokenAVault,
          tokenBVault,
          lpMint,
          userTokenA,
          userTokenB,
          userLp,
          walletKeypair.publicKey,
          lpAmount,
          minTokenAAmount,
          minTokenBAmount,
          signer
        );

        const result = await rpcConnection.sendTransaction(tx);
        await waitForConfirmation(rpcConnection, result);
        console.log("Transaction sent successfully!", result);
      } catch (error) {
        handleError(error);
      }
    });
}
