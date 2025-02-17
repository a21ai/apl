#!/usr/bin/env node

import { Command } from "commander";
import createKeypairCommand from "./commands/create-keypair.js";
import balanceCommand from "./commands/balance.js";
import createTokenCommand from "./commands/create-token.js";
import mintCommand from "./commands/mint.js";
import createAccountCommand from "./commands/create-account.js";
import configCommand from "./commands/config.js";
import transferCommand from "./commands/transfer.js";
import tokensCommand from "./commands/tokens.js";
import deployCommand from "./commands/deploy.js";

const program = new Command();

program
  .name("apl-cli")
  .description("CLI for wallet and token operations on Arch network")
  .version("0.0.1");

// Register all commands
createKeypairCommand(program);
balanceCommand(program);
createTokenCommand(program);
mintCommand(program);
tokensCommand(program);
createAccountCommand(program);
configCommand(program);
transferCommand(program);
deployCommand(program);

program.parseAsync(process.argv);
