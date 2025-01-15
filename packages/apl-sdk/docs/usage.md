# APL Token Library Documentation

## Core Features

- Token Creation and Management
- Associated Token Accounts
- Transaction Signing (Node.js and Web)
- Error Handling

## Token Operations

### Creating Tokens

```typescript
import { createMint } from '@repo/apl-sdk';

const mint = await createMint(authority, null, 6, signer);
```

### Transferring Tokens

```typescript
import { transfer } from '@repo/apl-sdk';

await transfer(source, destination, owner, amount, signer);
```

### Managing Token Accounts

```typescript
import { createAssociatedTokenAccount } from '@repo/apl-sdk';

const ata = await createAssociatedTokenAccount(mint, owner, signer);
```

## Web Integration

```typescript
// Web wallet signing
const webSigner = async (tx) => await wallet.signTransaction(tx);
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

## Token Creation Tutorial

This tutorial walks you through creating a new token on the Arch network using the APL SDK.

### Step 1: Set Up Your Environment
First, ensure you have the SDK installed and your environment configured:

```typescript
import { 
  createMint, 
  createRpcConnection,
  createKeypair,
  createSignerFromKeypair
} from '@repo/apl-sdk';
import { RuntimeTransaction } from '@repo/arch-sdk';

// Configure RPC connection
const rpcConfig = {
  url: process.env.APL_RPC_URL,        // e.g., "https://rpc.example.com"
  username: process.env.APL_RPC_USER,   // Optional: RPC auth username
  password: process.env.APL_RPC_PASS    // Optional: RPC auth password
};
const connection = createRpcConnection(rpcConfig);
```

### Step 2: Prepare Your Keypair
You'll need a keypair that will serve as the mint authority:

```typescript
// For development/testing: Generate a new keypair
const keypair = createKeypair();
console.log("Mint Authority Public Key:", Buffer.from(keypair.publicKey).toString("hex"));

// For production: Load existing keypair
// const keypair = loadKeypair(); // Your keypair loading logic
```

### Step 3: Create Signing Callback
The SDK requires a signing callback to authorize transactions. Choose the appropriate method for your environment:

#### Node.js Environment
For Node.js applications where you have direct access to private keys:

```typescript
// Node.js environment (using keypair)
const nodeSigner = createSignerFromKeypair(keypair);
```

#### Web Environment
For web applications using browser wallets:

```typescript
// Web environment (using UniSat wallet)
const webSigner: SignerCallback = async (tx: RuntimeTransaction) => {
  // Check if UniSat wallet is available
  if (typeof window === 'undefined' || !window.unisat) {
    throw new Error('UniSat wallet not found. Please install the UniSat extension.');
  }

  try {
    // Request wallet connection if needed
    if (!await window.unisat.isConnected()) {
      await window.unisat.requestAccounts();
    }

    // Get the current account
    const [address] = await window.unisat.getAccounts();
    console.log('Connected wallet address:', address);

    // Sign the transaction
    return await window.unisat.signTransaction(tx);
  } catch (error) {
    if (error.message.includes('User rejected')) {
      throw new Error('User denied transaction signing');
    }
    throw error;
  }
};

// Alternative: Using a custom web wallet
const customWalletSigner: SignerCallback = async (tx: RuntimeTransaction) => {
  // Implement your wallet's signing logic
  const wallet = window.customWallet;
  await wallet.connect();
  return await wallet.signTransaction(tx);
};
```

Important web wallet considerations:
- Ensure wallet extension is installed and accessible
- Handle wallet connection state and permissions
- Implement proper error handling for user rejections
- Consider wallet disconnection/reconnection scenarios
- Verify wallet compatibility with your application

### Step 4: Create the Token
Now you can create your token with the desired configuration:

```typescript
async function createToken() {
  try {
    const decimals = 6; // Number of decimal places
    const freezeAuthority = null; // Optional: Add freeze authority

    console.log("Creating new token...");
    const mint = await createMint(
      keypair.publicKey,  // Mint authority
      freezeAuthority,    // Freeze authority (null for none)
      decimals,          // Decimal precision
      nodeSigner        // Your signing callback
    );

    console.log("Token created successfully!");
    console.log("Token Mint Address:", Buffer.from(mint).toString("hex"));
    
    // The token is now recognized on the Arch network
    // Users can create associated token accounts for this mint
    return mint;
  } catch (error) {
    console.error("Error creating token:", error);
    throw error;
  }
}
```

### Step 5: Verify Token Creation
After creating the token, you can verify it exists:

```typescript
async function verifyToken(mintAddress: Uint8Array) {
  try {
    const mintInfo = await connection.readAccountInfo(mintAddress);
    if (!mintInfo?.data) {
      throw new Error("Token mint not found");
    }
    console.log("Token verified on-chain!");
    return true;
  } catch (error) {
    console.error("Error verifying token:", error);
    return false;
  }
}
```

### Complete Example
Here's a complete example putting it all together:

```typescript
async function main() {
  try {
    // Set up connection and keypair
    const connection = createRpcConnection(rpcConfig);
    const keypair = createKeypair();
    const signer = createSignerFromKeypair(keypair);

    // Create token
    const mintAddress = await createMint(
      keypair.publicKey,
      null,
      6,
      signer
    );
    console.log("Token created:", Buffer.from(mintAddress).toString("hex"));

    // Verify creation
    await verifyToken(mintAddress);
  } catch (error) {
    console.error("Failed to create token:", error);
  }
}
```

This token is now a permanent part of the Arch network. Users can create associated token accounts and interact with it using the token's mint address.

## Error Handling Guide

The APL SDK provides detailed error information for common scenarios. Here's how to handle various error cases:

### Common Error Scenarios

1. **Invalid Mint Authority**
```typescript
try {
  await createMint(publicKey, null, 6, signer);
} catch (error) {
  if (error.message.includes('invalid owner')) {
    console.error('You are not authorized to mint tokens');
    // Handle unauthorized mint attempt
  }
}
```

2. **Insufficient Funds**
```typescript
try {
  await transfer(source, destination, owner, amount, signer);
} catch (error) {
  if (error.message.includes('insufficient funds')) {
    console.error('Not enough tokens in source account');
    // Handle insufficient balance
  }
}
```

3. **Invalid Addresses**
```typescript
try {
  const mintInfo = await connection.readAccountInfo(mintAddress);
  if (!mintInfo?.data) {
    throw new Error('Invalid mint address');
  }
} catch (error) {
  if (error.message.includes('Invalid mint address')) {
    console.error('The provided mint address is invalid or does not exist');
    // Handle invalid address
  }
}
```

4. **Missing Associated Token Account**
```typescript
try {
  await transfer(source, destination, owner, amount, signer);
} catch (error) {
  if (error.message.includes('account not found')) {
    console.error('Associated token account does not exist');
    // Guide user to create associated token account first
  }
}
```

### Best Practices for Error Handling

1. **Always Use Try-Catch Blocks**
```typescript
async function safeOperation() {
  try {
    // Your operation here
    await operation();
  } catch (error) {
    // Log the error for debugging
    console.error('Operation failed:', error);
    
    // Provide user-friendly error message
    if (error instanceof Error) {
      handleUserError(error.message);
    }
    
    // Optionally rethrow or return error state
    throw error;
  }
}
```

2. **Check Preconditions**
```typescript
async function createToken(decimals: number) {
  // Validate input
  if (decimals < 0 || decimals > 9) {
    throw new Error('Decimals must be between 0 and 9');
  }
  
  // Verify wallet connection
  if (!await isWalletConnected()) {
    throw new Error('Wallet not connected');
  }
  
  // Proceed with creation
  return await createMint(...);
}
```

3. **Handle Network Issues**
```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error)) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  throw lastError;
}
```

### Error Prevention Tips

1. Always verify account existence before operations
2. Check token balances before transfers
3. Validate input parameters (addresses, amounts, decimals)
4. Ensure proper wallet connection and permissions
5. Handle network timeouts and retries appropriately

## Usage Examples

### Transferring Tokens

```typescript
import { transfer } from '@repo/apl-sdk';

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
} from '@repo/apl-sdk';

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
import { setAuthority, AuthorityType } from '@repo/apl-sdk';

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
