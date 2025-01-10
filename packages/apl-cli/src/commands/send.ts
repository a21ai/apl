import { Command } from 'commander';
import { loadKeypairWithPubkey, createSignerFromKeypair, handleError } from '../utils.js';
import { PubkeyUtil } from '@repo/arch-sdk';

export default function sendCommand(program: Command) {
  program
    .command('send')
    .description('Send tokens to another address')
    .requiredOption('-k, --keypair <path>', 'sender keypair file path')
    .requiredOption('-t, --to <address>', 'recipient address')
    .requiredOption('-a, --amount <number>', 'amount to send')
    .action(async (options) => {
      try {
        const { keypairData, pubkey } = loadKeypairWithPubkey();
        const recipientPubkey = PubkeyUtil.fromHex(options.to);
        const amount = BigInt(options.amount);

        console.log('Creating transfer transaction...');
        console.log(`From: ${keypairData.publicKey}`);
        console.log(`To: ${options.to}`);
        console.log(`Amount: ${options.amount}`);

        // Create and send transfer transaction (stubbed)
        const signer = createSignerFromKeypair(keypairData);
        // const tx = await transferTx(
        //   pubkey,
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
