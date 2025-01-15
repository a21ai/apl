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

## Prerequisites and Setup

Before using any token-related commands, you must:

1. Install required software:
   - Node.js >= 18
   - Access to an Arch network RPC endpoint

2. Create a keypair (required for most operations):
   ```bash
   # Create keypair at default location (~/.apl-cli/keypair.json)
   apl-cli create-keypair

   # Or specify custom location
   apl-cli create-keypair -o /path/to/keypair.json
   ```

3. Configure RPC endpoint:
   ```bash
   # Set RPC URL (required for network operations)
   apl-cli config set --url <your-rpc-url>

   # Optionally set custom keypair location
   apl-cli config set --keypair /path/to/keypair.json
   ```

You can verify your setup at any time:
```bash
apl-cli config get
```

## Configuration

The CLI uses a JSON configuration file located at `~/.apl-cli/config.json`:

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

### tokens

Description:
List all token mints and their details.

Prerequisites:
- RPC URL must be configured (see "Setup" section)

Usage:
```bash
apl-cli tokens [-v]
```

Options:
- `-v, --verbose` - Show detailed token information including initialization status

Examples:
```bash
# List basic token information
apl-cli tokens

# Show detailed token information
apl-cli tokens -v
```

### create-account

Description:
Create an Associated Token Account (ATA) for a specific token mint.

Prerequisites:
- Keypair must exist (see "Setup" section)
- Token mint must exist
- RPC URL must be configured

Usage:
```bash
apl-cli create-account <token_address>
```

Arguments:
- `<token_address>` (Required) - Public key of the token mint account

Examples:
```bash
apl-cli create-account deadbeef...  # Replace with actual token mint address
```

Notes:
- Creates an ATA for your keypair and the specified token mint
- Fails if token mint doesn't exist
- Uses keypair from config file

### balance

Description:
Show token balances for all your token accounts.

Prerequisites:
- Keypair must exist (see "Setup" section)
- RPC URL must be configured

Usage:
```bash
apl-cli balance [-v]
```

Options:
- `-v, --verbose` - Show detailed token information including decimals, total supply, token state, and delegation details

Examples:
```bash
# Show non-zero balances
apl-cli balance

# Show all token accounts with details
apl-cli balance -v
```

Notes:
- Only shows non-zero balances by default
- Shows all token accounts in verbose mode
- Uses keypair from config file

### transfer

Description:
Transfer tokens from your account to another account.

Prerequisites:
- Keypair must exist (see "Setup" section)
- Source and destination token accounts must exist
- RPC URL must be configured

Usage:
```bash
apl-cli transfer -t <recipient-address> -m <token-mint> -a <amount>
```

Options:
- `-t, --to <address>` (Required) - Recipient's wallet address
- `-m, --mint <address>` (Required) - Token mint address
- `-a, --amount <number>` (Required) - Amount to transfer

Examples:
```bash
apl-cli transfer --to deadbeef... --mint cafe... --amount 100
```

Notes:
- Both source and destination token accounts must exist
- Source account is derived from your config keypair
- Amount must be within your balance
- Fails if token accounts don't exist

### create-token

Description:
Create a new token mint with specified parameters.

Prerequisites:
- Keypair must exist (see "Setup" section)
- RPC URL must be configured

Usage:
```bash
apl-cli create-token [--decimals <n>] [--freeze-authority <pubkey>]
```

Options:
- `--decimals <n>` - Number of decimals (default: 9)
- `--freeze-authority <pubkey>` - Optional freeze authority public key

Examples:
```bash
# Create token with default settings
apl-cli create-token

# Create token with custom decimals
apl-cli create-token --decimals 6

# Create token with freeze authority
apl-cli create-token --freeze-authority deadbeef...
```

Notes:
- Creates new mint account
- Sets your keypair as mint authority
- Initializes token with specified decimals
- Creates an ATA for the authority
- Outputs mint address for future use

### mint

Description:
Mint new tokens to a recipient account (requires mint authority).

Prerequisites:
- Keypair must exist (see "Setup" section)
- Must be the mint authority
- Recipient's token account must exist
- RPC URL must be configured

Usage:
```bash
apl-cli mint -m <mint-address> -t <recipient-address> -a <amount>
```

Options:
- `-m, --mint <address>` (Required) - Token mint address
- `-t, --to <address>` (Required) - Recipient wallet address
- `-a, --amount <number>` (Required) - Amount to mint

Examples:
```bash
# Mint tokens to an address
apl-cli mint --mint cafe... --to deadbeef... --amount 1000

# Mint tokens to yourself (omit --to)
apl-cli mint --mint cafe... --amount 1000
```

Notes:
- Your keypair must be the mint authority
- Validates mint authority before attempting to mint
- Recipient's token account must exist
- Amount must be a positive integer

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
