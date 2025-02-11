import { Command } from "commander";
import {
  loadKeypair,
  handleError,
  createRpcConnection,
} from "../utils.js";
import {
  addLiquidityTx,
  createSignerFromKeypair,
  waitForConfirmation,
} from "@repo/apl-sdk";
import { PubkeyUtil } from "@repo/apl-sdk";

export default function addLiquidityCommand(program: Command) {
  program
    .command("add-liquidity")
    .description("Add liquidity to an AMM pool")
    .requiredOption("--pool <pubkey>", "Pool address")
    .requiredOption("--token-a-vault <pubkey>", "Token A vault address")
    .requiredOption("--token-b-vault <pubkey>", "Token B vault address")
    .requiredOption("--lp-mint <pubkey>", "LP token mint address")
    .requiredOption("--user-token-a <pubkey>", "User's token A account")
    .requiredOption("--user-token-b <pubkey>", "User's token B account")
    .requiredOption("--user-lp <pubkey>", "User's LP token account")
    .requiredOption("--token-a-amount <number>", "Amount of token A to add")
    .requiredOption("--token-b-amount <number>", "Amount of token B to add")
    .option("--min-lp-amount <number>", "Minimum LP tokens to receive", "0")
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
        const tokenAAmount = BigInt(options.tokenAAmount);
        const tokenBAmount = BigInt(options.tokenBAmount);
        const minLpAmount = BigInt(options.minLpAmount);

        console.log("Adding liquidity to AMM pool...");
        console.log(`Pool: ${options.pool}`);
        console.log(`Token A Amount: ${tokenAAmount}`);
        console.log(`Token B Amount: ${tokenBAmount}`);
        console.log(`Minimum LP Amount: ${minLpAmount}`);

        // Create and send add liquidity transaction
        const signer = createSignerFromKeypair(walletKeypair);

        const tx = await addLiquidityTx(
          pool,
          tokenAVault,
          tokenBVault,
          lpMint,
          userTokenA,
          userTokenB,
          userLp,
          walletKeypair.publicKey,
          tokenAAmount,
          tokenBAmount,
          minLpAmount,
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
