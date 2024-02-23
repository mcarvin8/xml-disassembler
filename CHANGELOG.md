## [1.0.6-release.1](https://github.com/mcarvin8/xml-disassembler/compare/v1.0.5...v1.0.6-release.1) (2024-02-23)

### Bug Fixes

- configure logging with log4js ([65b106a](https://github.com/mcarvin8/xml-disassembler/commit/65b106afac9206c3db4a9ef352e3b08d2085b051))

## [1.0.5](https://github.com/mcarvin8/xml-disassembler/compare/v1.0.4...v1.0.5) (2024-02-22)

### Bug Fixes

- dynamically get xml namespace and add to disassembled/reassembled files if defined ([59544ee](https://github.com/mcarvin8/xml-disassembler/commit/59544ee961f2aa637ca8c90a0b2477c0fa5aadb1))

## [1.0.4](https://github.com/mcarvin8/xml-disassembler/compare/v1.0.3...v1.0.4) (2024-02-22)

### Bug Fixes

- add purge flag to disassemble to remove any pre-existing disassembled files ([c0d6049](https://github.com/mcarvin8/xml-disassembler/commit/c0d6049fa229ca9826ad9a8e20f092bf27cc5d32))

## [1.0.3](https://github.com/mcarvin8/xml-disassembler/compare/v1.0.2...v1.0.3) (2024-02-22)

### Bug Fixes

- switch to relative path in index ([25acde7](https://github.com/mcarvin8/xml-disassembler/commit/25acde788d15c9619e32de47230a1c408d573832))

## [1.0.3-release.1](https://github.com/mcarvin8/xml-disassembler/compare/v1.0.2...v1.0.3-release.1) (2024-02-22)

### Bug Fixes

- switch to relative path in index ([25acde7](https://github.com/mcarvin8/xml-disassembler/commit/25acde788d15c9619e32de47230a1c408d573832))

## [1.0.2](https://github.com/mcarvin8/xml-disassembler/compare/v1.0.1...v1.0.2) (2024-02-21)

### Bug Fixes

- ensure xmlPath is a directory ([5076799](https://github.com/mcarvin8/xml-disassembler/commit/50767991fb0ee91261ebe5d3723a70c9baf20cc6))
- remove the root xml element as a reassemble flag and dynamically get it from a disassembled file in the path ([849cf3b](https://github.com/mcarvin8/xml-disassembler/commit/849cf3b8d5878f62471d5810b5acbe0cf638e3f0))

## [1.0.1](https://github.com/mcarvin8/xml-disassembler/compare/v1.0.0...v1.0.1) (2024-02-21)

### Bug Fixes

- ensure all matches of duplicate parent elements are removed in the reassembled file, including opening tags which have the namespace in them ([f9e7919](https://github.com/mcarvin8/xml-disassembler/commit/f9e79198eb839236bc1a5505db08edfd0abdcddb))
- include root element tags in all disassembled files ([2a24cd2](https://github.com/mcarvin8/xml-disassembler/commit/2a24cd27fe56ea2703bb83d6274cdae6e5000a3b))
- remove xmlElement flag. this can be found in the original XML file and set dynamically in the leaf file. ([847f4ed](https://github.com/mcarvin8/xml-disassembler/commit/847f4edc8b625731537752c066f14d2b4ff13406))
- update tsconfig includes value ([d92afcb](https://github.com/mcarvin8/xml-disassembler/commit/d92afcb47f967b1afc01579c7066eb68d12faac4))
- use the full name of the original file to name the disassembled leaf file ([1f56382](https://github.com/mcarvin8/xml-disassembler/commit/1f56382062b357cf3d81aec3b3cd92ff3f5bbca7))

## [1.0.1-release.2](https://github.com/mcarvin8/xml-disassembler/compare/v1.0.1-release.1...v1.0.1-release.2) (2024-02-21)

### Bug Fixes

- update tsconfig includes value ([d92afcb](https://github.com/mcarvin8/xml-disassembler/commit/d92afcb47f967b1afc01579c7066eb68d12faac4))

## [1.0.1-release.1](https://github.com/mcarvin8/xml-disassembler/compare/v1.0.0...v1.0.1-release.1) (2024-02-21)

### Bug Fixes

- ensure all matches of duplicate parent elements are removed in the reassembled file, including opening tags which have the namespace in them ([f9e7919](https://github.com/mcarvin8/xml-disassembler/commit/f9e79198eb839236bc1a5505db08edfd0abdcddb))
- include root element tags in all disassembled files ([2a24cd2](https://github.com/mcarvin8/xml-disassembler/commit/2a24cd27fe56ea2703bb83d6274cdae6e5000a3b))
- remove xmlElement flag. this can be found in the original XML file and set dynamically in the leaf file. ([847f4ed](https://github.com/mcarvin8/xml-disassembler/commit/847f4edc8b625731537752c066f14d2b4ff13406))
- use the full name of the original file to name the disassembled leaf file ([1f56382](https://github.com/mcarvin8/xml-disassembler/commit/1f56382062b357cf3d81aec3b3cd92ff3f5bbca7))

# 1.0.0 (2024-02-21)

### Bug Fixes

- add jests to tsconfig ([d90f1ec](https://github.com/mcarvin8/xml-disassembler/commit/d90f1ecbabb73901efc21bf9e1fdc3a1fd442375))
- add types node to tsconfig.json ([9fb9a64](https://github.com/mcarvin8/xml-disassembler/commit/9fb9a643dba86bb2f884c781314065b5b9f0054a))
- re-add index file, rename package due to existing xml-transformer package ([9d67cdc](https://github.com/mcarvin8/xml-disassembler/commit/9d67cdca3fbfbbf9bbe065cc15300f6d7e58a577))

### Features

- initial commit ([1598834](https://github.com/mcarvin8/xml-disassembler/commit/1598834b5734c395c27d8907bc7ca38096e3724b))
