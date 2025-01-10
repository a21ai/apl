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

Mint new tokens:
```bash
apl-cli token mint \
  -k ./minter-keypair.json \
  -m mint-address \
  -t recipient-address \
  -a 1000
```

Options:
- `-k, --keypair <path>` - Minter's keypair file path (required)
- `-m, --mint <address>` - Mint address (required)
- `-t, --to <address>` - Recipient's address (required)
- `-a, --amount <number>` - Amount to mint (required)

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
