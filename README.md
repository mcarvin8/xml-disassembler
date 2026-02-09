# xml-disassembler

[![NPM](https://img.shields.io/npm/v/xml-disassembler.svg?label=xml-disassembler)](https://www.npmjs.com/package/xml-disassembler)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/LICENSE.md)
[![Downloads/week](https://img.shields.io/npm/dw/xml-disassembler.svg)](https://npmjs.org/package/xml-disassembler)
[![Maintainability](https://qlty.sh/badges/e226ad95-4b8d-484a-9484-25862941262d/maintainability.svg)](https://qlty.sh/gh/mcarvin8/projects/xml-disassembler)
[![Code Coverage](https://qlty.sh/badges/e226ad95-4b8d-484a-9484-25862941262d/test_coverage.svg)](https://qlty.sh/gh/mcarvin8/projects/xml-disassembler)
[![Known Vulnerabilities](https://snyk.io//test/github/mcarvin8/xml-disassembler/badge.svg?targetFile=package.json)](https://snyk.io//test/github/mcarvin8/xml-disassembler?targetFile=package.json)

Split large XML files into smaller, version-control–friendly pieces—then reassemble them when needed. Output as XML, INI, JSON, JSON5, TOML, or YAML.

Useful for cleaner diffs, easier collaboration, and workflows like Salesforce metadata.

> **Rust implementation:** For a native, high-performance alternative, see [xml-disassembler-rust](https://github.com/mcarvin8/xml-disassembler-rust).

---

## Table of contents

- [Quick start](#quick-start)
- [Features](#features)
- [Install](#install)
- [Disassembling](#disassembling)
- [Disassembly strategies](#disassembly-strategies)
- [Reassembling](#reassembling)
- [Ignore file](#ignore-file)
- [Logging](#logging)
- [XML parser](#xml-parser)
- [Use case](#use-case)
- [Development](#development)
- [License](#license)

---

## Quick start

```typescript
import {
  DisassembleXMLFileHandler,
  ReassembleXMLFileHandler,
} from "xml-disassembler";

// Disassemble: one XML → many small files
const disassemble = new DisassembleXMLFileHandler();
await disassemble.disassemble({
  filePath: "path/to/YourFile.permissionset-meta.xml",
  uniqueIdElements:
    "application,apexClass,name,flow,object,recordType,tab,field",
  format: "json",
  strategy: "unique-id",
});

// Reassemble: many small files → one XML
const reassemble = new ReassembleXMLFileHandler();
await reassemble.reassemble({
  filePath: "path/to/YourFile",
  fileExtension: "permissionset-meta.xml",
});
```

---

## Features

- **Disassemble** – Break XML into smaller components (by unique ID or by tag).
- **Reassemble** – Rebuild the original XML from disassembled output.
- **Multiple formats** – Output (and reassemble from) XML, INI, JSON, JSON5, TOML, or YAML.
- **Strategies** – `unique-id` (one file per nested element) or `grouped-by-tag` (one file per tag).
- **Ignore rules** – Exclude paths via a `.xmldisassemblerignore` file (same style as `.gitignore`).
- **Logging** – Configurable logging via `log4js` (writes to `disassemble.log` by default).
- **Salesforce-friendly** – Fits metadata and similar XML-heavy workflows.

Reassembly preserves element content and structure; element order may differ (especially with TOML).

---

## Install

```bash
npm install xml-disassembler
```

---

## Disassembling

```typescript
import { DisassembleXMLFileHandler } from "xml-disassembler";

const handler = new DisassembleXMLFileHandler();
await handler.disassemble({
  filePath: "test/baselines/general",
  uniqueIdElements:
    "application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field",
  prePurge: true,
  postPurge: true,
  ignorePath: ".xmldisassemblerignore",
  format: "json",
  strategy: "unique-id",
});
```

| Option             | Description                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| `filePath`         | Path to the XML file or directory to disassemble.                           |
| `uniqueIdElements` | Comma-separated element names used to derive filenames for nested elements. |
| `prePurge`         | Remove existing disassembly output before running (default: `false`).       |
| `postPurge`        | Remove the source XML after disassembly (default: `false`).                 |
| `ignorePath`       | Path to the ignore file (default: `.xmldisassemblerignore`).                |
| `format`           | Output format: `xml`, `ini`, `json`, `json5`, `toml`, `yaml`.               |
| `strategy`         | `unique-id` or `grouped-by-tag`.                                            |

---

## Disassembly strategies

### unique-id (default)

Each nested element is written to its own file, named by a unique identifier (or a SHA-256 hash if no UID is available). Leaf content stays in a file named after the original XML.

Best for fine-grained diffs and version control.

**Example layouts**

| Format    | UID-based layout                                                                                                                                                                                                               | Hash-based layout                                                                                                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **XML**   | [![XML UID](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled.png)](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled.png)               | [![XML Hash](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-hashes.png)](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-hashes.png)               |
| **YAML**  | [![YAML UID](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-yaml.png)](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-yaml.png)    | [![YAML Hash](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-hashes-yaml.png)](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-hashes-yaml.png)    |
| **JSON**  | [![JSON UID](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-json.png)](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-json.png)    | [![JSON Hash](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-hashes-json.png)](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-hashes-json.png)    |
| **JSON5** | [![JSON5 UID](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-json5.png)](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-json5.png) | [![JSON5 Hash](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-hashes-json5.png)](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-hashes-json5.png) |
| **TOML**  | [![TOML UID](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-toml.png)](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-toml.png)    | [![TOML Hash](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-hashes-toml.png)](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-hashes-toml.png)    |
| **INI**   | [![INI UID](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-ini.png)](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-ini.png)       | [![INI Hash](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-hashes-ini.png)](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-hashes-ini.png)       |

### grouped-by-tag

All nested elements with the same tag go into one file per tag. Leaf content stays in the base file named after the original XML.

Best for fewer files and quick inspection.

**Example layouts**

| Format    | Layout                                                                                                                                                                                                                                   |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **XML**   | [![XML tag](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-tags.png)](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-tags.png)               |
| **YAML**  | [![YAML tag](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-tags-yaml.png)](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-tags-yaml.png)    |
| **JSON**  | [![JSON tag](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-tags-json.png)](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-tags-json.png)    |
| **JSON5** | [![JSON5 tag](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-tags-json5.png)](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-tags-json5.png) |
| **TOML**  | [![TOML tag](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-tags-toml.png)](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-tags-toml.png)    |
| **INI**   | [![INI tag](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-tags-ini.png)](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-tags-ini.png)       |

---

## Reassembling

```typescript
import { ReassembleXMLFileHandler } from "xml-disassembler";

const handler = new ReassembleXMLFileHandler();
await handler.reassemble({
  filePath: "test/baselines/general/HR_Admin",
  fileExtension: "permissionset-meta.xml",
  postPurge: true,
});
```

| Option          | Description                                                                       |
| --------------- | --------------------------------------------------------------------------------- |
| `filePath`      | Directory that contains the disassembled files (e.g. `HR_Admin/`).                |
| `fileExtension` | Suffix for the rebuilt XML file (e.g. `permissionset-meta.xml`). Default: `.xml`. |
| `postPurge`     | Remove disassembled files after a successful reassembly (default: `false`).       |

---

## Ignore file

Exclude files or directories from disassembly using an ignore file (default: `.xmldisassemblerignore`). Syntax matches [node-ignore](https://github.com/kaelzhang/node-ignore) (similar to `.gitignore`).

Example:

```
# Skip these paths
**/secret.xml
**/generated/
```

---

## Logging

The Rust crate uses [env_logger](https://docs.rs/env_logger). Set `RUST_LOG` to control verbosity (e.g. `RUST_LOG=debug`).

---

## XML parser

Parsing is done with [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser), with support for:

- **CDATA** – `"![CDATA["`
- **Comments** – `"!---"`
- **Attributes** – `"@__**"`

---

## Use case

For a Salesforce CLI integration example, see [sf-decomposer](https://github.com/mcarvin8/sf-decomposer).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for code style, PR process, and coverage expectations.

---

## License

This project is based on a template by [Allan Oricil](https://github.com/AllanOricil); the original template code is under the [ISC license](LICENSE.isc). The xml-disassembler code is under the [MIT license](LICENSE.md).
