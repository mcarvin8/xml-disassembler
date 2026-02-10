# Contributing to xml-disassembler

Contributions are welcome. This repo is the **Node.js/TypeScript wrapper** that exposes the [xml-disassembler Rust crate](https://github.com/mcarvin8/xml-disassembler-rust) via [Neon](https://neon-bindings.com). Core disassemble/reassemble logic lives in the Rust crate; this guide covers the wrapper (bindings, API, and build).

## Requirements

- **Node.js** ≥ 20
- **Rust** (stable) – for building the native addon
- **npm**

## Setup

1. **Fork and clone**

   Fork the repo on GitHub, then clone your fork:

   ```bash
   git clone https://github.com/mcarvin8/xml-disassembler.git
   cd xml-disassembler
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

## Development workflow

1. Create a branch for your change.
2. Make your changes (TypeScript/Neon bindings in this repo; core algorithm changes may belong in the [Rust crate](https://github.com/mcarvin8/xml-disassembler-rust)).
3. Run tests and lint (see below).
4. Commit. Pre-commit hooks will run Prettier via lint-staged.
5. Push and open a pull request.

## Scripts

| Command               | Description                                       |
| --------------------- | ------------------------------------------------- |
| `npm test`            | Run Jest with coverage                            |
| `npm run lint`        | Run ESLint                                        |
| `npm run format`      | Format code with Prettier                         |
| `npm run build`       | Build native addon (Rust) and JS bundles (Rollup) |
| `npm run build:crate` | Build only the Neon native addon                  |
| `npm run build:js`    | Build only the TypeScript/JS output (Rollup)      |

## Code quality

- **Tests** – New or changed behavior in the Node/TypeScript layer should have tests. The project aims for **≥ 90% code coverage**; keep coverage at or above that.
- **Linting** – Code must pass `npm run lint` (ESLint).
- **Formatting** – Code is formatted with Prettier. Use `npm run format` to fix formatting; the pre-commit hook also runs Prettier on staged files via lint-staged.

## Where to contribute

- **This repo** – Node/TypeScript API, Neon bindings (`src/lib.rs`, `src/index.ts`), build and tooling, tests for the wrapper.
- **[xml-disassembler-rust](https://github.com/mcarvin8/xml-disassembler-rust)** – Core disassembly/reassembly logic, ignore-file handling, and format/output behavior.

## Submitting changes

1. **Pull request** – Open a PR against `main`. Describe what changed and why.
2. **Scope** – Prefer one logical change per PR (one fix or one feature).
3. **Checks** – Ensure CI passes (tests and lint). Run `npm test` and `npm run lint` locally before pushing.
