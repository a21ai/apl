import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { Keypair } from '@solana/web3.js';
import { handleError } from '../utils.js';

export default function createKeypairCommand(program: Command) {
  program
    .command('create-keypair')
    .description('Creates a local private keypair and saves to file')
    .option('-o, --output <path>', 'output file path', './keypair.json')
    .action((options) => {
      try {
        const keypair = Keypair.generate();
        const filePath = path.resolve(options.output);
        
        // Create directory if it doesn't exist
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, JSON.stringify({
          publicKey: Buffer.from(keypair.publicKey.toBytes()).toString('hex'),
          secretKey: Buffer.from(keypair.secretKey).toString('hex')
        }, null, 2));
        
        console.log(`Keypair saved to ${filePath}`);
      } catch (error) {
        handleError(error);
      }
    });
}
