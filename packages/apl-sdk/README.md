# APL Token Library

A JavaScript library for creating and signing APL token transactions on the Arch network.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Quick Setup](#quick-setup)
5. [Features](#features)
6. [Documentation](#documentation)

## Getting Started

### Prerequisites
- Node.js >= 18
- Yarn or npm package manager
- Access to an Arch network RPC endpoint
- Basic understanding of token operations

### Installation
```bash
yarn add @repo/apl-sdk
```

### Quick Setup
1. Configure your RPC endpoint:
```typescript
import { createRpcConnection } from '@repo/apl-sdk';

const rpcConfig = {
  url: "YOUR_RPC_URL",
  username: "YOUR_USERNAME", // Optional
  password: "YOUR_PASSWORD"  // Optional
};

const connection = createRpcConnection(rpcConfig);
```

2. Prepare a signing callback:
```typescript
// For Node.js environment
const nodeSigner = async (tx) => {
  // Sign transaction using private key
  return signedTx;
};

// For web environment (e.g., UniSat wallet)
const webSigner = async (tx) => {
  // Sign using web wallet
  return await wallet.signTransaction(tx);
};
```

3. Start using the SDK:
```typescript
import { createMint } from '@repo/apl-sdk';

// Create a new token
const mint = await createMint(
  mintAuthority,  // Your public key
  null,           // Optional freeze authority
  6,             // Decimals
  signer         // Your signing callback
);
```

For detailed examples and API reference, see the [usage guide](./docs/usage.md).

## Features

- Create and manage APL tokens
- Transfer tokens between accounts
- Approve and revoke token delegations
- Mint and burn tokens
- Manage token authorities
- Create associated token accounts
- Support for both Node.js and web3 wallet environments

## Documentation

For detailed usage instructions and API reference, see the [APL Token Documentation](./docs/usage.md).

## Installation

```bash
yarn add @repo/apl-sdk
```

## Quick Start

```typescript
import { createMint, transfer } from '@repo/apl-sdk';
import { RuntimeTransaction } from '@repo/arch-sdk';

// Example: Create a new token
const mint = await createMint(
  mintAuthority,  // Public key of mint authority
  null,           // Optional freeze authority
  6,             // Decimals
  signer         // Signing callback
);

// Example: Transfer tokens
await transfer(
  source,       // Source account
  destination,  // Destination account
  owner,        // Token account owner
  100n,         // Amount (as BigInt)
  signer        // Signing callback
);
```

For more examples and detailed documentation, see the [usage guide](./docs/usage.md).
