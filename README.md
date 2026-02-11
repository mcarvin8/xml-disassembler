# xml-disassembler

[![NPM](https://img.shields.io/npm/v/xml-disassembler.svg?label=xml-disassembler)](https://www.npmjs.com/package/xml-disassembler)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/LICENSE.md)
[![Downloads/week](https://img.shields.io/npm/dw/xml-disassembler.svg)](https://npmjs.org/package/xml-disassembler)
[![Maintainability](https://qlty.sh/badges/e226ad95-4b8d-484a-9484-25862941262d/maintainability.svg)](https://qlty.sh/gh/mcarvin8/projects/xml-disassembler)
[![Code Coverage](https://qlty.sh/badges/e226ad95-4b8d-484a-9484-25862941262d/test_coverage.svg)](https://qlty.sh/gh/mcarvin8/projects/xml-disassembler)
[![Known Vulnerabilities](https://snyk.io//test/github/mcarvin8/xml-disassembler/badge.svg?targetFile=package.json)](https://snyk.io//test/github/mcarvin8/xml-disassembler?targetFile=package.json)

Split large XML files into smaller, version-control–friendly pieces—then reassemble them when needed. Output as XML, JSON, JSON5, or YAML.

Useful for cleaner diffs, easier collaboration, and workflows like Salesforce metadata.

> **Native Rust:** Core logic is in the [xml-disassembler](https://crates.io/crates/xml-disassembler) crate; this package provides Node.js bindings via [Neon](https://neon-bindings.com).

---

## Table of contents

- [Quick start](#quick-start)
- [Features](#features)
- [Install](#install)
- [Disassembling](#disassembling)
- [Disassembly strategies](#disassembly-strategies)
- [Multi-level disassembly](#multi-level-disassembly)
- [Reassembling](#reassembling)
- [Ignore file](#ignore-file)
- [Logging](#logging)
- [Implementation](#implementation)
- [Use case](#use-case)
- [Contributing](#contributing)
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
- **Multiple formats** – Output (and reassemble from) XML, JSON, JSON5, or YAML.
- **Strategies** – `unique-id` (one file per nested element) or `grouped-by-tag` (one file per tag).
- **Ignore rules** – Exclude paths via a `.xmldisassemblerignore` file (same style as `.gitignore`).
- **Logging** – Uses [env_logger](https://docs.rs/env_logger); set `RUST_LOG` for verbosity (e.g. `RUST_LOG=debug`).
- **Salesforce-friendly** – Fits metadata and similar XML-heavy workflows.

Reassembly preserves element content and structure.

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

| Option             | Description                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `filePath`         | Path to the XML file or directory to disassemble.                                                                                     |
| `uniqueIdElements` | Comma-separated element names used to derive filenames for nested elements.                                                           |
| `multiLevel`       | Optional. Multi-level spec: `file_pattern:root_to_strip:unique_id_elements`. See [Multi-level disassembly](#multi-level-disassembly). |
| `prePurge`         | Remove existing disassembly output before running (default: `false`).                                                                 |
| `postPurge`        | Remove the source XML after disassembly (default: `false`).                                                                           |
| `ignorePath`       | Path to the ignore file (default: `.xmldisassemblerignore`).                                                                          |
| `format`           | Output format: `xml`, `json`, `json5`, `yaml`.                                                                                        |
| `strategy`         | `unique-id` or `grouped-by-tag`.                                                                                                      |

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

---

## Multi-level disassembly

For XML with nested repeatable blocks (e.g. `programProcesses` inside `LoyaltyProgramSetup`), you can disassemble in one call and reassemble in one call. Pass a **multi-level spec** so the tool further splits matching files and later merges them in the right order.

**Spec format:** `file_pattern:root_to_strip:unique_id_elements`  
Example: `programProcesses:programProcesses:parameterName,ruleName` — for files whose name contains `programProcesses`, strip the `programProcesses` root and disassemble by `parameterName` and `ruleName`.

```typescript
import {
  DisassembleXMLFileHandler,
  ReassembleXMLFileHandler,
} from "xml-disassembler";

const disassemble = new DisassembleXMLFileHandler();
await disassemble.disassemble({
  filePath: "Cloud_Kicks_Inner_Circle.loyaltyProgramSetup-meta.xml",
  uniqueIdElements: "fullName,name,processName",
  multiLevel: "programProcesses:programProcesses:parameterName,ruleName",
  postPurge: true,
});

const reassemble = new ReassembleXMLFileHandler();
await reassemble.reassemble({
  filePath: "Cloud_Kicks_Inner_Circle",
  fileExtension: "loyaltyProgramSetup-meta.xml",
  postPurge: true,
});
```

| Option       | Description                                                                 |
| ------------ | --------------------------------------------------------------------------- |
| `multiLevel` | Optional. `file_pattern:root_to_strip:unique_id_elements` for nested split. |

A `.multi_level.json` config is written in the disassembly root so reassembly knows how to merge inner levels first, then the top level. No extra options are needed for reassembly.

**Caveat:** Multi-level reassembly removes disassembled directories after reassembling each level, even when you do not pass `postPurge`. This is required so the next level can merge the reassembled XML files. Use version control (e.g. Git) to recover the tree if needed, or run reassembly only in a pipeline where these changes can be discarded.

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

Exclude files or directories from disassembly using an ignore file (default: `.xmldisassemblerignore`). Syntax is the same as [`.gitignore`](https://git-scm.com/docs/gitignore) (e.g. patterns, `**/`, negation).

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

## Implementation

The core logic is implemented in Rust ([xml-disassembler](https://crates.io/crates/xml-disassembler)) and exposed to Node.js via [Neon](https://neon-bindings.com). Building from source requires Rust and Node.js.

---

## Use case

For a Salesforce CLI integration example, see [sf-decomposer](https://github.com/mcarvin8/sf-decomposer).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for code style, PR process, and coverage expectations.

---

## License

This project is based on a template by [Allan Oricil](https://github.com/AllanOricil); the original template code is under the [ISC license](LICENSE.isc). The xml-disassembler code is under the [MIT license](LICENSE.md).
