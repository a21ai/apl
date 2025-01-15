# APL Token Library Documentation

## Overview

The APL Token library provides a JavaScript interface for creating and managing tokens on the Arch network.

## Core Features

- Create and manage tokens (requires UTXO for account creation)
- Transfer tokens between accounts
- Mint and burn tokens (requires mint authority)
- Create associated token accounts (requires UTXO)
- Support for Node.js and web environments

## Token Operations

The APL SDK provides core token operations with minimal setup required. Each operation that creates new accounts requires a valid UTXO with sufficient funds.

### Creating Tokens
```typescript
import { Pubkey } from '@repo/arch-sdk';
import { initializeMintTx, Keypair } from '@repo/apl-sdk';

const tx = await initializeMintTx(
  mintKeypair,      // Keypair for the new mint account
  utxo,             // UTXO for account creation
  9,                // Decimals (default)
  mintAuthority,    // Mint authority public key
  null,             // Optional freeze authority
  signer           // Transaction signing callback
);
```

### Creating Associated Token Accounts
```typescript
import { Pubkey } from '@repo/arch-sdk';
import { associatedTokenTx } from '@repo/apl-sdk';

const tx = await associatedTokenTx(
  utxo,               // UTXO for account creation
  associatedToken,    // Associated token account pubkey
  ownerPubkey,       // Owner's public key
  mintPubkey,        // Token mint address
  signer            // Transaction signing callback
);
```

### Minting Tokens
```typescript
import { Pubkey } from '@repo/arch-sdk';
import { mintToTx } from '@repo/apl-sdk';

const tx = await mintToTx(
  mintPubkey,         // Token mint address
  recipientPubkey,    // Recipient token account
  amount,             // Amount to mint
  mintAuthority,      // Mint authority public key
  signer             // Transaction signing callback
);
```

### Transferring Tokens
```typescript
import { Pubkey } from '@repo/arch-sdk';
import { transferTx } from '@repo/apl-sdk';

const tx = await transferTx(
  sourceTokenPubkey,    // Source token account
  mintPubkey,          // Token mint address
  destinationPubkey,   // Destination token account
  ownerPubkey,        // Owner of source account
  amount,             // Amount to transfer
  9,                 // Decimals (default)
  signer            // Transaction signing callback
);

## Error Handling

The library throws descriptive errors for common issues:

```typescript
try {
  const tx = await transferTx(
    sourceTokenPubkey,
    mintPubkey,
    destinationPubkey,
    ownerPubkey,
    amount,
    9,
    signer
  );
} catch (error) {
  // Handle specific error cases
  console.error('Operation failed:', error);
}
```

## Error Handling

The library throws descriptive errors for common issues:

```typescript
try {
  await transfer(source, destination, owner, amount, signer);
} catch (error) {
  // Handle specific error cases
  console.error('Operation failed:', error);
}
```

## API Reference

### Token Instructions

#### `initializeMintTx(mintKeypair: Keypair, utxo: UtxoMetaData, decimals: number, mintAuthority: Pubkey, freezeAuthority: Pubkey | null, signer: SignerCallback): Promise<RuntimeTransaction>`
Creates a new token mint. Requires a UTXO with sufficient funds for account creation.

- `mintKeypair`: Keypair for the new mint account
- `utxo`: UTXO metadata for account creation (must have sufficient funds)
- `decimals`: Number of decimals for token precision (default: 9)
- `mintAuthority`: Public key authorized to mint tokens
- `freezeAuthority`: Optional public key authorized to freeze accounts (null for fixed supply)
- `signer`: Transaction signing callback

#### `mintToTx(mint: Pubkey, recipient: Pubkey, amount: bigint, mintAuthority: Pubkey, signer: SignerCallback): Promise<RuntimeTransaction>`
Mints new tokens to a recipient account. Requires mint authority.

- `mint`: Token mint address
- `recipient`: Recipient token account (must be initialized)
- `amount`: Amount to mint as BigInt
- `mintAuthority`: Public key with mint authority
- `signer`: Transaction signing callback

#### `transferTx(source: Pubkey, mint: Pubkey, destination: Pubkey, owner: Pubkey, amount: bigint, decimals: number, signer: SignerCallback): Promise<RuntimeTransaction>`
Transfers tokens between accounts. Both accounts must exist.

- `source`: Source token account
- `mint`: Token mint address
- `destination`: Destination token account
- `owner`: Owner of the source account
- `amount`: Amount to transfer as BigInt
- `decimals`: Token decimals (default: 9)
- `signer`: Transaction signing callback

#### `associatedTokenTx(utxo: UtxoMetaData, associatedToken: Pubkey, owner: Pubkey, mint: Pubkey, signer: SignerCallback): Promise<RuntimeTransaction>`
Creates an associated token account. Requires a UTXO with sufficient funds.

- `utxo`: UTXO metadata for account creation
- `associatedToken`: Associated token account public key
- `owner`: Owner's public key
- `mint`: Token mint address
- `signer`: Transaction signing callback

## Error Handling

The library throws descriptive errors for common issues:

```typescript
try {
  const tx = await transferTx(
    sourceTokenPubkey,
    mintPubkey,
    destinationPubkey,
    ownerPubkey,
    amount,
    9,
    signer
  );
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
