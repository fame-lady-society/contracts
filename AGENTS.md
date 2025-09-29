# Repository Guidelines

This Hardhat-based Solidity project maintains the Fame Lady Society wrapped NFT contracts. Use this guide to align contributions with existing tooling and security practices.

## Project Structure & Module Organization
- Core Solidity lives in `contracts/`; keep interfaces next to the consumers.
- Deployment flows run through `deploy/` scripts and persist in `deployments/`; tag new scripts when shipping features.
- Tests and helpers are TypeScript under `test/` and `test/utils/`.
- Generated output (`artifacts/`, `cache/`, `typechain-types/`) is disposable—never edit by hand.
- Shared config and env helpers sit in `utils/`; extend `env.ts` when introducing new secrets.

## Build, Test, and Development Commands
- `yarn install` – install dependencies and Hardhat plugins.
- `yarn hardhat compile` – compile Solidity 0.8.x contracts and refresh TypeChain bindings.
- `yarn hardhat test` – run the Mocha/Chai suite; use `--grep` to focus on one behavior.
- `yarn hardhat deploy --network sepolia` – execute tagged deploy scripts; add `--tags wrapped` (or similar) to scope runs.
- `yarn hardhat verify:wrappednft --network homestead` – sample custom verify task wired in `hardhat.config.ts`.

## Coding Style & Naming Conventions
- Solidity: 4-space indentation, `CamelCase` contracts, `camelCase` functions, and explicit custom errors.
- Group public/external functions before internal helpers, mirroring `WrappedNFT.sol`.
- TypeScript: ES modules with strict typing; run `npx prettier --check "**/*.{ts,sol}"` before pushing.
- Import generated factories from `typechain-types/` instead of rebuilding ABI typings.

## Testing Guidelines
- Tests rely on Hardhat + Viem/Ethers v6; prefer `deployments.fixture()` for deterministic setup.
- Name suites after the contract (`describe("WrappedNFT")`) and child blocks after behaviors (`"wrap"`, `"unwrap"`).
- Cover revert paths (zero-token wrap, tip forwarding failures, role checks) and assert metadata events.
- Run `yarn hardhat test --network hardhat`; set `REPORT_GAS=true` alongside `COINMARKETCAP_API_KEY` when you need gas metrics.

## Commit & Pull Request Guidelines
- Follow the existing log: concise, imperative subjects (`Add rescue guard`, `Fix unwrap revert`).
- PRs should summarize intent, list touched contracts/scripts, and paste test output.
- Link issues or deployment notes for on-chain changes and explain any new env variables.
- Confirm `keys/` remains encrypted and `.env` updates are documented, not committed.

## Security & Configuration Tips
- Provide secrets via uppercase network prefixes (e.g., `SEPOLIA_RPC`, `SEPOLIA_DEPLOYMENT_KEY_FILE`); never hardcode keys.
- Remove debug logging that exposes private keys—`hardhat.config.ts` executes during every command.
- Keep keystore passwords out of the repo and share them only through the agreed secret channel.
