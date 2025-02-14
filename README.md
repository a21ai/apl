# Archway Project

A token management system for the Arch Network, providing TypeScript SDKs and tools for token operations.

## Project Structure

This monorepo contains the following packages:

### Package Reference

The following packages are available for reference:

- Apps: `frontend`, `docs`
- Packages: `apl-cli`, `apl-sdk`, `arch-sdk`
- Arch Program: `apl-amm`, `apl-sats`, `associated-token-account`, `token`

## Development

To get a local arch validator running, run the docker compose file:

```bash
docker compose up -d
```

This will start a local validator RPC url running on http://localhost:9002.
