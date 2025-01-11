import { jest } from '@jest/globals';
import { Command } from 'commander';
import os from 'os';
import path from 'path';
import configCommand from '../../src/commands/config.js';
import * as configModule from '../../src/config.js';
import type { CliConfig } from '../../src/config.js';

// Mock the config module
jest.mock('../../src/config.js');

// Get mocked module
const mockedConfigModule = jest.mocked(configModule);

// Constants
const CONFIG_DIR = path.join(os.homedir(), '.apl-sdk');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const DEFAULT_CONFIG: CliConfig = {
  keypair: path.join(os.homedir(), '.apl-sdk', 'id.json'),
  rpcUrl: 'http://localhost:9002'
};

// Declare program variable
let program: Command;

// Setup mock implementations before each test
beforeEach(() => {
  jest.clearAllMocks();
  program = new Command();
  
  // Reset process.exitCode
  process.exitCode = 0;
  
  // Reset console spies
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  
  // Reset all mocks
  jest.clearAllMocks();
  
  // Reset process.exitCode
  process.exitCode = 0;
  
  // Reset console spies
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  
  // Mock getConfig implementation
  mockedConfigModule.getConfig.mockImplementation(async () => {
    const config = DEFAULT_CONFIG;
    console.log('Config File:', CONFIG_FILE);
    console.log('RPC URL:', config.rpcUrl);
    console.log('Keypair Path:', config.keypair);
  });
  
  // Mock setConfig implementation with Promise resolution
  mockedConfigModule.setConfig.mockImplementation(async (options: Partial<CliConfig>) => {
    // Validate options first
    if (!options.rpcUrl && !options.keypair) {
      console.error('Error: Please provide at least one option to set');
      process.exitCode = 1;
      return;
    }
    
    // Update config
    const newConfig = { ...DEFAULT_CONFIG, ...options };
    
    // Log success
    console.log('Config updated successfully');
    console.log('Config File:', CONFIG_FILE);
    if (options.rpcUrl) console.log('RPC URL:', options.rpcUrl);
    if (options.keypair) console.log('Keypair Path:', options.keypair);
    
    return Promise.resolve();
  });
});

describe('Config Command', () => {
  let program: Command;

  beforeEach(() => {
    jest.clearAllMocks();
    program = new Command();
  });

  const getConfigCommand = () => {
    configCommand(program);
    const configCmd = program.commands[0];
    if (!configCmd) throw new Error('Config command not found');
    if (!configCmd.commands) throw new Error('Config subcommands not found');
    return configCmd;
  };

  const getSubcommand = (cmd: Command, name: string): Command => {
    if (!cmd.commands) throw new Error('No subcommands found');
    const subCmd = cmd.commands.find(subcmd => subcmd.name() === name);
    if (!subCmd) throw new Error(`Subcommand '${name}' not found`);
    return subCmd;
  };

  describe('get subcommand', () => {
    it('should call getConfig', async () => {
      const configCmd = getConfigCommand();
      const getCmd = getSubcommand(configCmd, 'get');
      await getCmd.parseAsync(['get']);
      expect(configModule.getConfig).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      (configModule.getConfig as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const configCmd = getConfigCommand();
      const getCmd = getSubcommand(configCmd, 'get');
      await getCmd.parseAsync(['get']);
      expect(console.error).toHaveBeenCalledWith('Error:', error.message);
    });
  });

  describe('set subcommand', () => {
    it('should require at least one option', async () => {
      const configCmd = getConfigCommand();
      const setCmd = getSubcommand(configCmd, 'set');
      
      await setCmd.parseAsync(['set']);
      expect(process.exitCode).toBe(1);
      expect(console.error).toHaveBeenCalledWith(
        'Error: Please provide at least one option to set'
      );
    });

    it('should call setConfig with url option', async () => {
      const configCmd = getConfigCommand();
      const setCmd = getSubcommand(configCmd, 'set');
      const url = 'http://test:8899';
      
      await setCmd.parseAsync(['set', '--url', url]);
      
      expect(configModule.setConfig).toHaveBeenCalledWith({
        rpcUrl: url
      });
    });

    it('should call setConfig with keypair option', async () => {
      const configCmd = getConfigCommand();
      const setCmd = getSubcommand(configCmd, 'set');
      const keypair = '/test/keypair.json';
      
      await setCmd.parseAsync(['set', '--keypair', keypair]);
      
      expect(configModule.setConfig).toHaveBeenCalledWith({
        keypair
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      mockedConfigModule.setConfig.mockImplementationOnce(async () => {
        throw error;
      });

      const configCmd = getConfigCommand();
      const setCmd = getSubcommand(configCmd, 'set');
      
      await setCmd.parseAsync(['set', '--url', 'http://test:8899']);
      
      expect(console.error).toHaveBeenCalledWith('Error:', 'Test error');
      expect(process.exitCode).toBe(1);
    });
  });
});
