# Repository Guidelines

This Hardhat-based Solidity project maintains the Fame Lady Society wrapped NFT contracts. Use this guide to align contributions with existing tooling and security practices.

## Project Structure & Module Organization

- Core Solidity lives in `contracts/`; keep interfaces next to the consumers.
- Deployment is via hardhat ignition modules in `./ignition/module`
- Tests are TypeScript under `test/`
- Legacy (Hardhat v2) tests are under `test.old/`. These do not work.
- Generated output (`artifacts/`, `cache/`, `typechain-types/`) is disposable—never edit by hand.
- Shared config and env helpers sit in `utils/`; extend `env.ts` when introducing new secrets.

## Build, Test, and Development Commands

- `yarn install` – install dependencies and Hardhat plugins.
- `yarn hardhat compile` – compile Solidity 0.8.x contracts and refresh TypeChain bindings.
- `yarn hardhat test` – run the test suite; add a path to a test file to focus on one test
- `yarn hardhat verify:wrappednft --network homestead` – sample custom verify task wired in `hardhat.config.ts`.

## Coding Style & Naming Conventions

- Solidity: 4-space indentation, `CamelCase` contracts, `camelCase` functions, and explicit custom errors.
- Group public/external functions before internal helpers, mirroring `WrappedNFT.sol`.

## Testing Guidelines

- Name suites after the contract (`describe("WrappedNFT")`) and child blocks after behaviors (`"wrap"`, `"unwrap"`).
- Run `dev-vault run fls-contracts yarn hardhat test [path to test]`.
- Add `--netowrk hardhat-seaport` if running `test/saveLady.ts` or all tests

## Commit & Pull Request Guidelines

- Follow the existing log: concise, imperative subjects (`Add rescue guard`, `Fix unwrap revert`).
- PRs should summarize intent, list touched contracts/scripts, and paste test output.
- Link issues or deployment notes for on-chain changes and explain any new env variables.
- Confirm `keys/` remains encrypted and `.env` updates are documented, not committed.

## Security & Configuration Tips

- Provide secrets via uppercase network prefixes (e.g., `SEPOLIA_RPC`, `SEPOLIA_DEPLOYMENT_KEY_FILE`); never hardcode keys.
- Remove debug logging that exposes private keys—`hardhat.config.ts` executes during every command.

## Seaport

You may find a `./seaport` directory in this repo. If present then this directory should contain a recent github checkout of the seaport solidity contracts. This directory may be used to perform additional research on the Seaport protocol.
