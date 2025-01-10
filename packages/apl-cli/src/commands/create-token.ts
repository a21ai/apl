import { Command } from 'commander';
import { loadKeypairWithPubkey, createSignerFromKeypair, handleError } from '../utils.js';
import { PubkeyUtil } from '@repo/arch-sdk';

export default function createTokenCommand(program: Command) {
  program
    .command('create-token')
    .description('Create a new token')
    .option('-d, --decimals <number>', 'number of decimals', '9')
    .option('-f, --freeze-authority <pubkey>', 'optional freeze authority')
    .action(async (options) => {
      try {
        const { keypairData, pubkey } = loadKeypairWithPubkey();
        const decimals = parseInt(options.decimals);
        const freezeAuthority = options.freezeAuthority 
          ? PubkeyUtil.fromHex(options.freezeAuthority)
          : null;

        console.log('Creating new token...');
        console.log(`Mint Authority: ${keypairData.publicKey}`);
        console.log(`Decimals: ${decimals}`);
        if (freezeAuthority) {
          console.log(`Freeze Authority: ${options.freezeAuthority}`);
        }

        // Create and send initialize mint transaction (stubbed)
        const signer = createSignerFromKeypair(keypairData);
        // const tx = await initializeMintTx(
        //   pubkey,
        //   decimals,
        //   pubkey,
        //   freezeAuthority,
        //   signer
        // );
        console.log('Transaction created (stub)');
      } catch (error) {
        handleError(error);
      }
    });
}
