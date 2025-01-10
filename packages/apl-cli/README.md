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

## Usage

### Keypair Management

Create a new keypair:
```bash
apl-cli create-keypair
# or specify output location
apl-cli create-keypair -o ./my-keypair.json
```

The keypair file is stored in JSON format:
```json
{
  "publicKey": "hex-encoded-public-key",
  "secretKey": "hex-encoded-secret-key"
}
```

### Wallet Operations

Check wallet balance:
```bash
apl-cli wallet balance -k ./keypair.json -r http://localhost:8899
```

Options:
- `-k, --keypair <path>` - Path to keypair file (required)
- `-r, --rpc <url>` - RPC endpoint URL (required)

### Token Operations

Send tokens:
```bash
apl-cli token send \
  -k ./sender-keypair.json \
  -t recipient-address \
  -a 1000
```

Options:
- `-k, --keypair <path>` - Sender's keypair file path (required)
- `-t, --to <address>` - Recipient's address (required)
- `-a, --amount <number>` - Amount to send (required)

Deploy a new token:
```bash
apl-cli token deploy \
  -k ./authority-keypair.json \
  -d 9 \
  -f freeze-authority-address
```

Options:
- `-k, --keypair <path>` - Authority's keypair file path (required)
- `-d, --decimals <number>` - Number of decimals for the token (default: 9)
- `-f, --freeze-authority <address>` - Optional freeze authority address

The deploy command will:
1. Create a new mint account
2. Initialize the token with specified decimals
3. Set up mint and freeze authorities
4. Create an associated token account for the authority
5. Output the mint address for future operations

Mint tokens (requires mint authority):
```bash
apl-cli token mint \
  -k ./authority-keypair.json \
  -m mint-address \
  -t recipient-address \
  -a 1000
```

Options:
- `-k, --keypair <path>` - Mint authority's keypair file path (required)
- `-m, --mint <address>` - Token mint address (required)
- `-t, --to <address>` - Recipient's address (required)
- `-a, --amount <number>` - Amount to mint (required)

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
