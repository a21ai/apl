# APL Token Library Documentation

## Installation

```bash
yarn add @repo/apl-token
```

## Overview

The APL Token library provides a JavaScript interface for creating and signing APL token transactions on the Arch network. It supports both Node.js and web environments, with flexible signing mechanisms to accommodate different wallet implementations.

## Key Features

- Create and manage APL tokens
- Transfer tokens between accounts
- Approve and revoke token delegations
- Mint and burn tokens
- Manage token authorities
- Create associated token accounts
- Support for both Node.js and web3 wallet environments

## Usage Examples

### Creating a New Token

```typescript
import { createMint, SignerCallback } from '@repo/apl-token';
import { RuntimeTransaction } from '@repo/arch-sdk';

// Example signer callback for Node.js
const nodeSigner: SignerCallback = async (tx: RuntimeTransaction) => {
  // Sign transaction using private key
  return signedTx;
};

// Example signer callback for web3 wallet
const webSigner: SignerCallback = async (tx: RuntimeTransaction) => {
  // Sign using web3 wallet (e.g., UniSat)
  return await wallet.signTransaction(tx);
};

// Create new token with 6 decimals
const mint = await createMint(
  mintAuthority,  // Public key of mint authority
  null,           // Optional freeze authority
  6,             // Decimals
  signer         // Signing callback
);
```

### Transferring Tokens

```typescript
import { transfer } from '@repo/apl-token';

// Transfer 100 tokens
await transfer(
  source,       // Source account
  destination,  // Destination account
  owner,        // Token account owner
  100n,         // Amount (as BigInt)
  signer        // Signing callback
);
```

### Creating Associated Token Account

```typescript
import { 
  createAssociatedTokenAccountTx,
  deriveAssociatedTokenAddress 
} from '@repo/apl-token';

// Derive associated token account address
const [associatedAddress] = await deriveAssociatedTokenAddress(
  walletAddress,  // Wallet public key
  mintAddress     // Token mint address
);

// Create associated token account
const tx = await createAssociatedTokenAccountTx(
  walletAddress,  // Wallet public key
  mintAddress,    // Token mint address
  payer,          // Account paying for creation
  signer          // Signing callback
);
```

### Managing Token Authorities

```typescript
import { setAuthority, AuthorityType } from '@repo/apl-token';

// Transfer mint authority
await setAuthority(
  mint,                    // Token mint address
  newAuthority,           // New authority public key
  AuthorityType.MintTokens,
  currentAuthority,       // Current authority public key
  signer                  // Signing callback
);
```

## API Reference

### Token Instructions

#### `createMint(mintAuthority, freezeAuthority, decimals, signer)`
Creates a new token mint.

- `mintAuthority`: Public key authorized to mint tokens
- `freezeAuthority`: Optional public key authorized to freeze accounts
- `decimals`: Number of decimals for token precision
- `signer`: Callback function for transaction signing
- Returns: Promise<RuntimeTransaction>

#### `transfer(source, destination, owner, amount, signer)`
Transfers tokens between accounts.

- `source`: Source token account
- `destination`: Destination token account
- `owner`: Owner of the source account
- `amount`: Amount to transfer (BigInt)
- `signer`: Signing callback
- Returns: Promise<RuntimeTransaction>

#### `approve(account, delegate, owner, amount, signer)`
Approves token delegation.

- `account`: Token account
- `delegate`: Delegate's public key
- `owner`: Account owner's public key
- `amount`: Amount to approve (BigInt)
- `signer`: Signing callback
- Returns: Promise<RuntimeTransaction>

### Associated Token Account

#### `deriveAssociatedTokenAddress(wallet, mint)`
Derives the associated token account address.

- `wallet`: Wallet public key
- `mint`: Token mint address
- Returns: Promise<[Uint8Array, number]> (address and bump seed)

#### `createAssociatedTokenAccountTx(wallet, mint, payer, signer)`
Creates an associated token account.

- `wallet`: Wallet public key
- `mint`: Token mint address
- `payer`: Account paying for creation
- `signer`: Signing callback
- Returns: Promise<RuntimeTransaction>

## Error Handling

The library throws descriptive errors for common issues:

```typescript
try {
  await transfer(source, destination, owner, amount, signer);
} catch (error) {
  if (error.message.includes('insufficient funds')) {
    // Handle insufficient balance
  } else if (error.message.includes('invalid owner')) {
    // Handle invalid ownership
  }
}
```

## Best Practices

1. Always use BigInt for token amounts to avoid precision issues
2. Implement proper error handling for transaction failures
3. Use associated token accounts for predictable account derivation
4. Test signing callbacks thoroughly in your environment
5. Verify transaction success after submission

## Security Considerations

1. Never expose private keys in web environments
2. Validate all input addresses before creating transactions
3. Implement proper access controls for mint and freeze authorities
4. Use proper error handling to prevent partial state changes
5. Verify transaction signatures before submission
