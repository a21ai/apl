# Archway Project

A comprehensive token management system built on Arch Network, featuring a Rust-based token program and TypeScript integration libraries.

## Project Overview

The Archway project consists of several key components:

1. **Token Program (Rust)**: Core token management functionality implemented in Rust
2. **APL Token Library**: TypeScript/JavaScript SDK for token operations
3. **Frontend Applications**: Next.js-based web interfaces for token management

### Long-term Development Plans

#### Phase 1: Token Program Implementation
- Integration of raw token program from Rust
- Implementation of core token operations (mint, transfer, burn)
- Security auditing and optimization

#### Phase 2: APL Token Library Development
- Cross-platform TypeScript/JavaScript SDK
- Support for both Node.js and browser environments
- Integration with @saturnbtcio/arch-sdk
- Comprehensive token account management

#### Phase 3: Frontend Integration
- Token balance interface implementation
- Wallet connection and management
- Transaction history and monitoring
- User-friendly token operations UI

## Getting Started

## Project Structure

This monorepo is built with Turborepo and includes the following components:

### Core Components

- `token-program`: Rust implementation of the token program (upcoming)
- `packages/apl-sdk`: TypeScript SDK for token operations
- `apps/frontend`: Main Next.js application for token management
- `apps/web`: Additional Next.js application
- `packages/ui`: Shared React component library
- `packages/eslint-config`: ESLint configurations
- `packages/typescript-config`: Shared TypeScript configurations

The project is primarily written in TypeScript, with the token program implemented in Rust.

### Development Tools

The project utilizes modern development tools:

- [TypeScript](https://www.typescriptlang.org/) for type-safe development
- [ESLint](https://eslint.org/) for code quality
- [Prettier](https://prettier.io) for consistent formatting
- Rust toolchain for token program development (upcoming)

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
pnpm dev
```

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
