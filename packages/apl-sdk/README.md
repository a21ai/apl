# APL Token Library

A JavaScript library for creating and signing APL token transactions on the Arch network.

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
