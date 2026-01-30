# Contributing to xml-disassembler

Contributions are welcome. This guide covers how to set up the project, run checks, and submit changes.

## Requirements

- **Node.js** ≥ 20
- **pnpm** ≥ 9

## Setup

1. **Fork and clone**

   Fork the repo on GitHub, then clone your fork:

   ```bash
   git clone https://github.com/mcarvin8/xml-disassembler.git
   cd xml-disassembler
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

## Development workflow

1. Create a branch for your change.
2. Make your changes.
3. Run tests and lint (see below).
4. Commit. Pre-commit hooks will run Prettier via lint-staged.
5. Push and open a pull request.

## Scripts

| Command          | Description                |
| ---------------- | -------------------------- |
| `pnpm test`      | Run Jest with coverage     |
| `pnpm run lint`  | Run ESLint                 |
| `pnpm format`    | Format code with Prettier  |
| `pnpm run build` | Build the library (Rollup) |

## Code quality

- **Tests** – New or changed behavior should have tests. The project aims for **≥ 90% code coverage**; keep coverage at or above that.
- **Linting** – Code must pass `pnpm run lint` (ESLint).
- **Formatting** – Code is formatted with Prettier. Use `pnpm format` to fix formatting; the pre-commit hook also runs Prettier on staged files via lint-staged.

## Submitting changes

1. **Pull request** – Open a PR against `main`. Describe what changed and why.
2. **Scope** – Prefer one logical change per PR (one fix or one feature).
3. **Checks** – Ensure CI passes (tests and lint). Run `pnpm test` and `pnpm run lint` locally before pushing.
