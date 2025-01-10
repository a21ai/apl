import { Command } from 'commander';
import { loadKeypairWithPubkey, createSignerFromKeypair, handleError } from '../utils.js';
import { PubkeyUtil } from '@repo/arch-sdk';

export default function mintCommand(program: Command) {
  program
    .command('mint')
    .description('Mint tokens to recipient (requires mint authority)')
    .requiredOption('-m, --mint <address>', 'token mint address')
    .requiredOption('-t, --to <address>', 'recipient address')
    .requiredOption('-a, --amount <number>', 'amount to mint')
    .action(async (options) => {
      try {
        const { keypairData, pubkey } = loadKeypairWithPubkey();
        const mintPubkey = PubkeyUtil.fromHex(options.mint);
        const recipientPubkey = PubkeyUtil.fromHex(options.to);
        const amount = BigInt(options.amount);

        console.log('Creating mint transaction...');
        console.log(`Mint Address: ${options.mint}`);
        console.log(`To Address: ${options.to}`);
        console.log(`Amount: ${options.amount}`);

        // Create and send mint transaction (stubbed)
        const signer = createSignerFromKeypair(keypairData);
        // const tx = await mintToTx(
        //   mintPubkey,
        //   recipientPubkey,
        //   amount,
        //   pubkey,
        //   signer
        // );
        console.log('Transaction created (stub)');
      } catch (error) {
        handleError(error);
      }
    });
}
