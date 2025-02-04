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

The 2 extension packages have been developed from xml-disassembler:

- [XML2JSON Disassembler](https://github.com/mcarvin8/xml2json-disassembler): Extension package which disassembles large XML files into smaller JSON files and reassembles the original XML file when needed
- [XML2YAML Disassembler](https://github.com/mcarvin8/xml2yaml-disassembler): Extension package which disassembles large XML files into smaller YAML files and reassembles the original XML file when needed

Please fork and raise PRs in these repos for any features or bug fixes specific to XML2JSON or XML2YAML issues. All 3 packages are built with node and pnpm.

Ensure the 2 extensions are updated to use the latest xml-disassembler.
