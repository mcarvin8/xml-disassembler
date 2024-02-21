# XML Disassembler

[![NPM](https://img.shields.io/npm/v/xml-disassembler.svg?label=xml-disassembler)](https://www.npmjs.com/package/xml-disassembler) [![Downloads/week](https://img.shields.io/npm/dw/xml-disassembler.svg)](https://npmjs.org/package/xml-disassembler)

A JS package to disassemble XML files into smaller, more manageable files and re-assemble them when needed.

This package is in active development and may have bugs. Once this is deemed stable, this plugin will be released as v1.0.0.

## Usage

Install the package:

```
npm install xml-disassembler
```

### Diassembling Files

Import the `DisassembleXMLFileHandler` class from the package.

Arguments:

- xmlElement: XML Root Element used for disassembled leaf file
- xmlPath: Directory containing the XML files to disassemble (must be directory). This will only disassemble files in the immediate directory.
- uniqueIdElements: (Optional) Comma-separated list of unique ID elements used to name disassembled files for nested elements. Defaults to SHA-256 hash if unique ID elements are undefined or not found.

```typescript
const handler = new DisassembleXMLFileHandler();
await handler.disassemble({
  xmlPath: "test/baselines/general",
  uniqueIdElements:
    "application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field",
  xmlElement: "PermissionSet",
});
```

#### File Handlers

It is up to the user to add additional file handlers before they run the `DisassembleXMLFileHandler` class.

```
Your Specific File Handlers --> This Plugin's `DisassembleXMLFileHandler` class
```

### Reassembling Files

Import the `ReassembleXMLFileHandler` class from the package.

Arguments:

- xmlElement: XML Root Element for the final reassembled file
- xmlPath: Path to the disassembled XML files to reassemble (must be a directory)
- xmlNamespace: (Optional) Namespace for the final XML (default: None)
- fileExtension: (Optional) Desired file extension for the final XML (default: `.xml`)

The reassembled XML file will be created in the parent directory of `xmlPath`.

```typescript
const handler = new ReassembleXMLFileHandler();
await handler.reassemble({
  xmlPath: "test/baselines/general/HR_Admin",
  xmlElement: "PermissionSet",
  xmlNamespace: "http://soap.sforce.com/2006/04/metadata",
  fileExtension: "permissionset-meta.xml",
});
```

## Template

This project was created from a template provided by [Allan Oricil](https://github.com/AllanOricil). Thank you Allan!

His original [license](https://github.com/AllanOricil/js-template/blob/main/LICENSE) remains in this project.
