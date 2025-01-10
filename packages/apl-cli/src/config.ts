import fs from 'fs';
import os from 'os';
import path from 'path';
export interface CliConfig {
  keypair: string;
  rpcUrl: string;
}

const DEFAULT_CONFIG: CliConfig = {
  keypair: path.join(os.homedir(), '.apl-sdk', 'id.json'),
  rpcUrl: 'http://localhost:9002'
};

const CONFIG_DIR = path.join(os.homedir(), '.apl-sdk');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export function ensureConfigDirExists(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function readConfig(): CliConfig {
  ensureConfigDirExists();
  
  if (!fs.existsSync(CONFIG_FILE)) {
    writeConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }

  try {
    const configStr = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(configStr);
  } catch (error) {
    console.error('Error reading config:', error);
    return DEFAULT_CONFIG;
  }
}

export function writeConfig(config: Partial<CliConfig>): void {
  ensureConfigDirExists();
  
  const currentConfig = readConfig();
  const newConfig = { ...currentConfig, ...config };
  
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
  } catch (error) {
    console.error('Error writing config:', error);
    throw error;
  }
}

export function getConfig(): void {
  const config = readConfig();
  console.log('Config File:', CONFIG_FILE);
  console.log('RPC URL:', config.rpcUrl);
  console.log('Keypair Path:', config.keypair);
}

export function setConfig(options: Partial<CliConfig>): void {
  if (!options.keypair && !options.rpcUrl) {
    console.error('Error: Please provide at least one option to set');
    process.exit(1);
  }

  try {
    writeConfig(options);
    console.log('Config updated successfully');
    getConfig();
  } catch (error) {
    console.error('Failed to update config:', error);
    process.exit(1);
  }
}
