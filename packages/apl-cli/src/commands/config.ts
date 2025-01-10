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
    .action(() => {
      try {
        getConfig();
      } catch (error) {
        handleError(error);
      }
    });

  config
    .command('set')
    .description('Update configuration')
    .option('-u, --url <url>', 'RPC endpoint URL')
    .option('-k, --keypair <path>', 'keypair file path')
    .action((options) => {
      try {
        const config: { rpcUrl?: string; keypair?: string } = {};
        if (options.url) config.rpcUrl = options.url;
        if (options.keypair) config.keypair = options.keypair;
        setConfig(config);
      } catch (error) {
        handleError(error);
      }
    });
}
