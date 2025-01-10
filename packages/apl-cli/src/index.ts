#!/usr/bin/env node

import { Command } from 'commander';
import createKeypairCommand from './commands/create-keypair.js';
import balanceCommand from './commands/balance.js';
import sendCommand from './commands/send.js';
import createTokenCommand from './commands/create-token.js';
import mintCommand from './commands/mint.js';
import supplyCommand from './commands/supply.js';
import accountsCommand from './commands/accounts.js';
import createAccountCommand from './commands/create-account.js';
import configCommand from './commands/config.js';

const program = new Command();

program
  .name('apl-cli')
  .description('CLI for wallet and token operations on Arch network')
  .version('0.0.1');

// Register all commands
createKeypairCommand(program);
balanceCommand(program);
sendCommand(program);
createTokenCommand(program);
mintCommand(program);
supplyCommand(program);
accountsCommand(program);
createAccountCommand(program);
configCommand(program);

program.parseAsync(process.argv);
