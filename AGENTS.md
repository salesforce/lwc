# LWC Project Instructions

## Package Manager

**Always use `yarn`, never `npm`.** This project uses yarn for dependency management.

## Common Commands

```bash
# Install dependencies
yarn

# Run tests
yarn test

# Run tests for a specific package
yarn test packages/@lwc/ssr-compiler

# Build all packages
yarn build

# Lint
yarn lint

# Format code
yarn format

# Run bundlesize checks
yarn bundlesize
```

## Repository Structure

This is a monorepo containing multiple packages under `packages/@lwc/`.

## Testing

Tests are colocated with source code in `__tests__` directories within each package.
