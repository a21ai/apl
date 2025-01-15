# APL Token Library Documentation

## Overview

The APL Token library provides a JavaScript interface for creating and managing tokens on the Arch network.

## Core Features

- Token Creation and Management (requires UTXO for account creation)
- Associated Token Accounts (requires UTXO for account creation)
- Transaction Signing (Node.js and Web)
- Error Handling

## Token Operations

The APL SDK provides core token operations. Each operation that creates new accounts requires a valid UTXO with sufficient funds.

### Creating Tokens
```typescript
import { Pubkey } from '@repo/arch-sdk';
import { initializeMintTx, Keypair, UtxoMetaData, SignerCallback } from '@repo/apl-sdk';

const tx = await initializeMintTx(
  mintKeypair: Keypair,
  utxo: UtxoMetaData,  // Required for account creation
  decimals: number,
  mintAuthority: Pubkey,
  freezeAuthority: Pubkey | null,
  signer: SignerCallback
);
```

### Creating Associated Token Accounts
```typescript
import { Pubkey } from '@repo/arch-sdk';
import { associatedTokenTx, UtxoMetaData, SignerCallback } from '@repo/apl-sdk';

const tx = await associatedTokenTx(
  utxo: UtxoMetaData,  // Required for account creation
  associatedToken: Pubkey,
  owner: Pubkey,
  mint: Pubkey,
  signer: SignerCallback
);
```

### Minting Tokens
```typescript
import { Pubkey } from '@repo/arch-sdk';
import { mintToTx, SignerCallback } from '@repo/apl-sdk';

const tx = await mintToTx(
  mint: Pubkey,
  recipient: Pubkey,
  amount: bigint,
  mintAuthority: Pubkey,  // Must be valid mint authority
  signer: SignerCallback
);
```

### Transferring Tokens
```typescript
import { Pubkey } from '@repo/arch-sdk';
import { transferTx, SignerCallback } from '@repo/apl-sdk';

const tx = await transferTx(
  source: Pubkey,
  mint: Pubkey,
  destination: Pubkey,
  owner: Pubkey,
  amount: bigint,
  decimals: number,
  signer: SignerCallback
);

## Overview

The APL Token library provides a JavaScript interface for creating and managing tokens on the Arch network.

## Key Features

- Create and manage tokens (requires UTXO for account creation)
- Transfer tokens between accounts
- Mint and burn tokens (requires mint authority)
- Create associated token accounts (requires UTXO)
- Support for Node.js and web environments

## Token Operations

The APL SDK provides core token operations with minimal setup required. Each operation that creates new accounts requires a valid UTXO with sufficient funds.

### Creating Tokens
```typescript
const tx = await initializeMintTx(
  mintKeypair,
  utxo,  // UTXO is required
  decimals,
  mintAuthority,
  freezeAuthority,
  signer
);
```

### Creating Associated Token Accounts
```typescript
const tx = await associatedTokenTx(
  utxo,  // Must specify UTXO for new ATA
  associatedTokenPubkey,
  owner,
  mintPubkey,
  signer
);
```

### Minting Tokens
```typescript
const tx = await mintToTx(
  mintPubkey,
  recipientPubkey,
  amount,
  mintAuthority,  // Must be valid mint authority
  signer
);
```

### Transferring Tokens
```typescript
const tx = await transferTx(
  sourcePubkey,
  mintPubkey,
  destinationPubkey,
  owner,
  amount,
  decimals,
  signer
);
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
- `decimals`: Number of decimals for token precision
- `mintAuthority`: Public key authorized to mint tokens
- `freezeAuthority`: Optional public key authorized to freeze accounts
- `signer`: Callback function for transaction signing

#### `mintToTx(mint: Pubkey, recipient: Pubkey, amount: bigint, mintAuthority: Pubkey, signer: SignerCallback): Promise<RuntimeTransaction>`
Mints new tokens to a recipient account.

- `mint`: Token mint address
- `recipient`: Recipient token account
- `amount`: Amount to mint (BigInt)
- `mintAuthority`: Authority to mint new tokens
- `signer`: Signing callback

#### `transferTx(source: Pubkey, mint: Pubkey, destination: Pubkey, owner: Pubkey, amount: bigint, decimals: number, signer: SignerCallback): Promise<RuntimeTransaction>`
Transfers tokens between accounts.

- `source`: Source token account
- `mint`: Token mint address
- `destination`: Destination token account
- `owner`: Owner of the source account
- `amount`: Amount to transfer (BigInt)
- `decimals`: Token decimals
- `signer`: Signing callback

#### `associatedTokenTx(utxo: UtxoMetaData, associatedToken: Pubkey, owner: Pubkey, mint: Pubkey, signer: SignerCallback): Promise<RuntimeTransaction>`
Creates an associated token account. Requires a UTXO with sufficient funds for account creation.

- `utxo`: UTXO metadata for account creation (must have sufficient funds)
- `associatedToken`: Associated token account public key
- `owner`: Owner's public key
- `mint`: Token mint address
- `signer`: Signing callback

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
