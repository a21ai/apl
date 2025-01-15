# @repo/apl-cli

Command-line interface for wallet and token operations on the Arch network.

## Installation

### Global Installation
```bash
npm install -g @repo/apl-cli
# or
yarn global add @repo/apl-cli
```

### Local Installation
```bash
npm install @repo/apl-cli
# or
yarn add @repo/apl-cli
```

## Prerequisites
- Node.js >= 18
- Access to an Arch network RPC endpoint

## Configuration

The CLI uses a JSON configuration file located at `~/.apl-sdk/config.json`:

```bash
### Configuration Commands

View current configuration:
```bash
apl-cli config get
```
Shows the current RPC URL and keypair path settings.

Update configuration:
```bash
apl-cli config set [options]
```

Options:
- `--url <url>` - Set RPC endpoint URL
- `--keypair <path>` - Set default keypair file path

Examples:
```bash
# Set RPC URL
apl-cli config set --url <url>

# Set default keypair
apl-cli config set --keypair <path>

# Set both URL and keypair
apl-cli config set --url <url> --keypair <path>
```
```

The config file stores:
- `rpcUrl`: RPC endpoint URL
- `keypair`: Path to default keypair file

## Usage

### Keypair Management

Create a new keypair:
```bash
apl-cli create-keypair [options]
```

Options:
- `-o, --output <path>` - Output file path (defaults to config keypair path)
- `-f, --force` - Force overwrite if file exists

The keypair file is stored in JSON format:
```json
{
  "publicKey": "hex-encoded-public-key",
  "secretKey": "hex-encoded-secret-key"
}
```

### Commands

List all token mints:
```bash
apl-cli tokens [-v]
```

Options:
- `-v, --verbose` - Show detailed token mint information

Create token account:
```bash
apl-cli create-account <token_address>
```

Arguments:
- `<token_address>` - Public key of the token mint account to create an associated token account for

Note: Creates an Associated Token Account (ATA) for the specified token mint. Uses keypair from config file.

Check token balance:
```bash
apl-cli balance [-v]
```

Options:
- `-v, --verbose` - Show detailed token information including decimals, total supply, token state, and delegation details

Note: Uses keypair and RPC URL from config file

Transfer tokens:
```bash
apl-cli transfer -t <recipient-address> -a <amount> --mint <token-mint>
```

Options:
- `-t, --to <address>` - Recipient's address (required)
- `-a, --amount <number>` - Amount to transfer (required)
- `-m, --mint <address>` - Token mint address (required)

Note: Uses keypair from config file. Associated Token Accounts are automatically derived and created if needed.

Create a new token:
```bash
apl-cli create-token [--decimals <n>] [--freeze-authority <pubkey>]
```

Options:
- `--decimals <n>` - Number of decimals (default: 9)
- `--freeze-authority <pubkey>` - Optional freeze authority

Note: Uses keypair path from config file. Set with `apl-cli config set --keypair <path>`

The create-token command will:
1. Create a new mint account
2. Initialize the token with specified decimals
3. Set up mint and freeze authorities
4. Create an associated token account for the authority
5. Output the mint address for future operations

Mint tokens (requires mint authority):
```bash
apl-cli mint -m <mint-address> -t <recipient-address> -a <amount>
```

Options:
- `-m, --mint <address>` - Token mint address (required)
- `-t, --to <address>` - Recipient address (required)
- `-a, --amount <number>` - Amount to mint (required)

Note: Uses keypair from config file. Must be mint authority. The command will validate mint authority before attempting to mint tokens. Associated Token Accounts are automatically derived and created for recipients if needed.

Note: The CLI automatically creates associated token accounts for recipients if they don't exist. This ensures tokens can be received without manual account setup.

## Development

### Building
```bash
yarn build
```

### Running Tests
```bash
yarn test
```

## License
This package is part of the Archway project.
