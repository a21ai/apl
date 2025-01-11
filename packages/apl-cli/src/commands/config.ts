import { Command } from 'commander';
import { handleError } from '../utils.js';
import { getConfig, setConfig } from '../config.js';

export default function configCommand(program: Command) {
  const config = program
    .command('config')
    .description('Configuration management');

  config
    .command('get')
    .description('Get current configuration')
    .action(async () => {
      try {
        await getConfig();
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exitCode = 1;
      }
    });

  config
    .command('set')
    .description('Update configuration')
    .option('-u, --url <url>', 'RPC endpoint URL')
    .option('-k, --keypair <path>', 'keypair file path')
    .action(async (options) => {
      try {
        const config: { rpcUrl?: string; keypair?: string } = {};
        if (options.url) config.rpcUrl = options.url;
        if (options.keypair) config.keypair = options.keypair;
        await setConfig(config);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exitCode = 1;
      }
    });
}
