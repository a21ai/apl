# Archway Project

A token management system for the Arch Network, providing TypeScript SDKs and tools for token operations.

## Overview

The project provides libraries and tools for creating and managing tokens on the Arch Network:

- **APL SDK**: Core TypeScript SDK for token operations
- **APL CLI**: Command-line interface for token management
- **Web Interface**: Next.js applications for token operations

## Project Structure

This monorepo contains the following packages:

### Core Packages
- `apl-sdk`: Core TypeScript SDK for token operations
- `apl-cli`: Command-line interface for token management
- `apl-token`: Token program implementation
- `arch-sdk`: Core Arch Network SDK
- `associated-token-account`: Associated token account management
- `token`: Token program interfaces

### Support Packages
- `ui`: Shared React component library
- `eslint-config`: Shared ESLint configurations
- `typescript-config`: Shared TypeScript configurations

## Development

### Prerequisites
- Node.js 18+
- pnpm (package manager)
- TypeScript 5.0+

### Build

To build all packages:

```bash
pnpm build
```

### Development

To start development mode:

```bash
pnpm dev
```

For detailed documentation on specific packages, refer to their respective README files in the packages directory.
