import { Keypair } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';

// Mock fs module
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn()
}));

// Mock process.exit
jest.spyOn(process, 'exit').mockImplementation((code?: number) => undefined as never);

describe('create-keypair command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new keypair file with correct format', () => {
    const mockKeypair = {
      publicKey: {
        toBytes: () => new Uint8Array([1, 2, 3])
      },
      secretKey: new Uint8Array([4, 5, 6])
    };
    
    jest.spyOn(Keypair, 'generate').mockReturnValue(mockKeypair as unknown as Keypair);
    
    const outputPath = './test-keypair.json';
    const expectedContent = {
      publicKey: Buffer.from([1, 2, 3]).toString('hex'),
      secretKey: Buffer.from([4, 5, 6]).toString('hex')
    };
    
    // Execute command
    const { default: createKeypairCommand } = require('../src/commands/create-keypair.js');
    createKeypairCommand({ output: outputPath });
    
    // Verify file was written with correct content
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.resolve(outputPath),
      JSON.stringify(expectedContent, null, 2)
    );
  });

  it('should create output directory if it doesn\'t exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    
    const outputPath = './nested/dir/keypair.json';
    const { default: createKeypairCommand } = require('../src/commands/create-keypair.js');
    createKeypairCommand({ output: outputPath });
    
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      path.dirname(path.resolve(outputPath)),
      { recursive: true }
    );
  });

  it('should handle write errors gracefully', () => {
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('Write failed');
    });
    
    const consoleSpy = jest.spyOn(console, 'error');
    const { default: createKeypairCommand } = require('../src/commands/create-keypair.js');
    createKeypairCommand({ output: 'test.json' });
    
    expect(consoleSpy).toHaveBeenCalledWith('Error:', 'Write failed');
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
