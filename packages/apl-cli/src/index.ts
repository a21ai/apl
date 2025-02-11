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
import initializePoolCommand from "./commands/initialize-pool.js";
import addLiquidityCommand from "./commands/add-liquidity.js";
import removeLiquidityCommand from "./commands/remove-liquidity.js";
import swapCommand from "./commands/swap.js";

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

// AMM commands
initializePoolCommand(program);
addLiquidityCommand(program);
removeLiquidityCommand(program);
swapCommand(program);

program.parseAsync(process.argv);
