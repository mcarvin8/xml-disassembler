# Contributing

Any contributions you would like to make to this repository are encouraged.

## Requirements

```
    "node": ">=18",
    "pnpm": ">=8"
```

## Setup

1. Clone the repository

```
git clone git@github.com:mcarvin8/xml-disassembler.git
```

2. Install dependencies

```
pnpm
```

## Branching

Please either create a new feature branch on this repository or fork the repository before making changes.

When your changes are ready for review, please create a Pull Request into the `main` branch on this repository.

## Testing

The test suite will disassemble and reassemble XMLs with different attributes and will test different class flags.

Use the following command from the root directory:

```
pnpm test
```

The test suite will copy all of the files found in `test/baselines` into a new `mock` directory before running the tests. After each disassemble test, the original file should be deleted to confirm it is reassembled correctly (whether it's via the `--postPurge` Boolean flag or manually deleting it to confirm coverage without the flag).

The final test in the suite should always be the comparison test. This test compares the `baseline` files against the `mock` files to confirm there are no changes. This will not compare files if they are only found in the `mock` directory (mostly disassembled files except for the error condition tests).

Ensure when you are adding new code & tests that all code reaches full code coverage.

This test suite will run automatically when you push a feature branch to this repository via GitHub Actions.
