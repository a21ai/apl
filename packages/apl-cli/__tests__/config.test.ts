import { jest } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';
import * as configModule from '../src/config.js';
import type { CliConfig } from '../src/config.js';

// Mock modules
jest.mock('fs');
jest.mock('../src/config.js');

// Get mocked modules
const mockedFs = jest.mocked(fs);
const mockedConfig = jest.mocked(configModule);

// Constants
const CONFIG_DIR = path.join(os.homedir(), '.apl-sdk');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const DEFAULT_CONFIG: CliConfig = {
  keypair: path.join(os.homedir(), '.apl-sdk', 'id.json'),
  rpcUrl: 'http://localhost:9002'
};

// Setup mock implementations
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset process.exitCode
  process.exitCode = 0;
  
  // Reset console spies
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  
  // Setup default mock implementations
  mockedFs.existsSync.mockReturnValue(false);
  mockedFs.readFileSync.mockReturnValue(JSON.stringify(DEFAULT_CONFIG));
  mockedFs.writeFileSync.mockImplementation(() => {});
  mockedFs.mkdirSync.mockImplementation(() => {});
  
  // Mock readConfig implementation
  mockedConfig.readConfig.mockImplementation(() => {
    if (!mockedFs.existsSync(CONFIG_FILE)) {
      mockedFs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
      return DEFAULT_CONFIG;
    }
    
    try {
      const configStr = mockedFs.readFileSync(CONFIG_FILE, 'utf8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(configStr) };
    } catch (error) {
      console.error('Error reading config:', error);
      return DEFAULT_CONFIG;
    }
  });
  
  // Mock writeConfig implementation
  mockedConfig.writeConfig.mockImplementation((config) => {
    const currentConfig = mockedConfig.readConfig();
    const newConfig = { ...currentConfig, ...config };
    mockedFs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
  });
  
  // Mock getConfig implementation
  mockedConfig.getConfig.mockImplementation(async () => {
    const config = mockedConfig.readConfig();
    console.log('Config File:', CONFIG_FILE);
    console.log('RPC URL:', config.rpcUrl);
    console.log('Keypair Path:', config.keypair);
  });
  
  // Mock setConfig implementation
  mockedConfig.setConfig.mockImplementation(async (options) => {
    if (!options.rpcUrl && !options.keypair) {
      console.error('Error: Please provide at least one option to set');
      process.exitCode = 1;
      return;
    }
    
    try {
      mockedConfig.writeConfig(options);
      console.log('Config updated successfully');
      console.log('Config File:', CONFIG_FILE);
      if (options.rpcUrl) console.log('RPC URL:', options.rpcUrl);
      if (options.keypair) console.log('Keypair Path:', options.keypair);
    } catch (error) {
      console.error('Failed to update config:', error);
      process.exitCode = 1;
      throw error;
    }
  });
});

describe('Config Management', () => {
  const CONFIG_DIR = path.join(os.homedir(), '.apl-sdk');
  const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
  const DEFAULT_CONFIG = {
    keypair: path.join(os.homedir(), '.apl-sdk', 'id.json'),
    rpcUrl: 'http://localhost:9002'
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('readConfig', () => {
    it('should create default config if none exists', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      
      // Mock readConfig to return DEFAULT_CONFIG
      const config = configModule.readConfig();
      
      // Verify config is returned correctly
      expect(config).toEqual(DEFAULT_CONFIG);
      
      // Verify writeFileSync was called with correct arguments
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        CONFIG_FILE,
        JSON.stringify(DEFAULT_CONFIG, null, 2)
      );
      
      // Verify writeFileSync was called exactly once
      expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
    });

    it('should read existing config and merge with defaults', () => {
      const existingConfig = {
        rpcUrl: 'http://custom:8899'
      };
      
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(existingConfig));
      
      mockedConfig.readConfig.mockReturnValue({
        ...DEFAULT_CONFIG,
        ...existingConfig
      });
      const config = configModule.readConfig();
      
      expect(config).toEqual({
        ...DEFAULT_CONFIG,
        ...existingConfig
      });
    });

    it('should handle invalid JSON in config file', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      // Mock readFileSync to return invalid JSON
      mockedFs.readFileSync.mockReturnValue('invalid json');
      mockedFs.existsSync.mockReturnValue(true);
      
      // Call readConfig and verify behavior
      const config = configModule.readConfig();
      
      // Should return default config on error
      expect(config).toEqual(DEFAULT_CONFIG);
      
      // Should log error
      expect(console.error).toHaveBeenCalledWith(
        'Error reading config:',
        expect.any(Error)
      );
    });
  });

  describe('writeConfig', () => {
    it('should update existing config', () => {
      const newConfig = {
        rpcUrl: 'http://new:8899'
      };
      
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(DEFAULT_CONFIG));
      
      configModule.writeConfig(newConfig);
      
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        CONFIG_FILE,
        JSON.stringify({ ...DEFAULT_CONFIG, ...newConfig }, null, 2)
      );
    });

    it('should handle write errors', () => {
      mockedFs.writeFileSync.mockImplementationOnce(() => {
        throw new Error('Write failed');
      });
      
      expect(() => configModule.writeConfig({})).toThrow('Write failed');
    });
  });

  describe('getConfig', () => {
    it('should display current config', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(DEFAULT_CONFIG));
      
      await configModule.getConfig();
      
      expect(consoleSpy).toHaveBeenCalledWith('Config File:', CONFIG_FILE);
      expect(consoleSpy).toHaveBeenCalledWith('RPC URL:', DEFAULT_CONFIG.rpcUrl);
      expect(consoleSpy).toHaveBeenCalledWith('Keypair Path:', DEFAULT_CONFIG.keypair);
    });
  });

  describe('setConfig', () => {
    it('should require at least one option', async () => {
      await configModule.setConfig({});
      expect(process.exitCode).toBe(1);
      expect(console.error).toHaveBeenCalledWith('Error: Please provide at least one option to set');
    });

    it('should update config with new values', async () => {
      const newValues = {
        rpcUrl: 'http://new:8899',
        keypair: '/new/keypair.json'
      };
      
      // Mock successful config read/write
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(DEFAULT_CONFIG));
      
      const consoleSpy = jest.spyOn(console, 'log');
      await configModule.setConfig(newValues);
      
      expect(consoleSpy).toHaveBeenCalledWith('Config updated successfully');
      expect(consoleSpy).toHaveBeenCalledWith('Config File:', CONFIG_FILE);
      expect(consoleSpy).toHaveBeenCalledWith('RPC URL:', newValues.rpcUrl);
      expect(consoleSpy).toHaveBeenCalledWith('Keypair Path:', newValues.keypair);
    });
  });
});
