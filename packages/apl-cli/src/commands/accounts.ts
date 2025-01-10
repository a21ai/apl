import { Command } from 'commander';
import { loadKeypairWithPubkey, createRpcConnection, handleError } from '../utils.js';
import { PubkeyUtil } from '@repo/arch-sdk';

export default function accountsCommand(program: Command) {
  program
    .command('accounts')
    .description('List all token accounts')
    .option('-v, --verbose', 'Show detailed token information')
    .action(async (options) => {
      try {
        const { keypairData, pubkey } = loadKeypairWithPubkey();
        const rpcConnection = createRpcConnection();

        console.log('Fetching token accounts...');
        console.log(`Owner: ${keypairData.publicKey}`);
        if (options.verbose) {
          console.log('Verbose mode enabled - will show detailed information');
        }

        // Stub: In real implementation, we would:
        // 1. Use rpcConnection to fetch all token accounts for owner
        // 2. For each account:
        //    - Get mint info
        //    - Get account balance
        //    - Format based on verbose flag
        console.log('Token accounts: Stub - Will implement actual account listing');
      } catch (error) {
        handleError(error);
      }
    });
}
