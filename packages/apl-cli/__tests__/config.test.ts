import { readConfig, writeConfig, getConfig, setConfig } from '../src/config.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn()
}));

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number) => undefined as never);

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
      
      const config = readConfig();
      
      expect(config).toEqual(DEFAULT_CONFIG);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        CONFIG_FILE,
        JSON.stringify(DEFAULT_CONFIG, null, 2)
      );
    });

    it('should read existing config and merge with defaults', () => {
      const existingConfig = {
        rpcUrl: 'http://custom:8899'
      };
      
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(existingConfig));
      
      const config = readConfig();
      
      expect(config).toEqual({
        ...DEFAULT_CONFIG,
        ...existingConfig
      });
    });

    it('should handle invalid JSON in config file', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('invalid json');
      
      const config = readConfig();
      
      expect(config).toEqual(DEFAULT_CONFIG);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('writeConfig', () => {
    it('should update existing config', () => {
      const newConfig = {
        rpcUrl: 'http://new:8899'
      };
      
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(DEFAULT_CONFIG));
      
      writeConfig(newConfig);
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        CONFIG_FILE,
        JSON.stringify({ ...DEFAULT_CONFIG, ...newConfig }, null, 2)
      );
    });

    it('should handle write errors', () => {
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Write failed');
      });
      
      expect(() => writeConfig({})).toThrow('Write failed');
    });
  });

  describe('getConfig', () => {
    it('should display current config', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(DEFAULT_CONFIG));
      
      getConfig();
      
      expect(consoleSpy).toHaveBeenCalledWith('Config File:', CONFIG_FILE);
      expect(consoleSpy).toHaveBeenCalledWith('RPC URL:', DEFAULT_CONFIG.rpcUrl);
      expect(consoleSpy).toHaveBeenCalledWith('Keypair Path:', DEFAULT_CONFIG.keypair);
    });
  });

  describe('setConfig', () => {
    it('should require at least one option', () => {
      setConfig({});
      
      expect(mockExit).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalledWith('Error: Please provide at least one option to set');
    });

    it('should update config with new values', () => {
      const newValues = {
        rpcUrl: 'http://new:8899',
        keypair: '/new/keypair.json'
      };
      
      setConfig(newValues);
      
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Config updated successfully');
    });
  });
});
