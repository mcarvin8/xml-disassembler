# Contributing

Contributions are welcome! If you would like to contribute, please fork the repository, make your changes, and submit a pull request.

## Requirements

- pnpm >= 8
- node >= 18

## Installation

### 1) Fork the repository

### 2) Install Dependencies

This will install all the tools needed to contribute

```bash
pnpm install
```

## Testing

When developing, run the provided tests for new additions.

```bash
pnpm test
```

## Extension Packages

These extension packages have been developed from `xml-disassembler`:

- [`xml2json-disassembler`](https://github.com/mcarvin8/xml2json-disassembler)
- [`xml2yaml-disassembler`](https://github.com/mcarvin8/xml2yaml-disassembler)
- [`xml2json5-disassembler`](https://github.com/mcarvin8/xml2json5-disassembler)

Please fork and raise PRs in these repos for any features or bug fixes specific to XML2JSON, XML2JSON5, or XML2YAML issues. All packages are built with `node` and `pnpm`.

Ensure the extensions are updated to use the latest `xml-disassembler`.
