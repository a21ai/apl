import { Command } from 'commander';
import { loadKeypairWithPubkey, createRpcConnection, handleError } from '../utils.js';

export default function balanceCommand(program: Command) {
  program
    .command('balance')
    .description('Get wallet balance on Arch network')
    .requiredOption('-k, --keypair <path>', 'keypair file path')
    .requiredOption('-r, --rpc <url>', 'RPC endpoint URL', 'http://localhost:9002')
    .action(async (options) => {
      try {
        const { keypairData, pubkey } = loadKeypairWithPubkey();
        const rpcConnection = createRpcConnection();
        
        console.log('Fetching wallet balance...');
        console.log(`Public Key: ${keypairData.publicKey}`);
        console.log(`RPC URL: ${options.rpc}`);
        
        // Stub: In real implementation, we would:
        // 1. Use rpcConnection to fetch account info
        // 2. Parse account data to get balance
        // 3. Display formatted balance
        console.log('Balance: Stub - Will implement actual balance check');
      } catch (error) {
        handleError(error);
      }
    });
}
