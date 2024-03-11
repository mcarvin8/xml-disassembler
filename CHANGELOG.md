## [1.1.3](https://github.com/mcarvin8/xml-disassembler/compare/v1.1.2...v1.1.3) (2024-03-11)

### Bug Fixes

- allow file-path to be accepted by disassemble ([31ecd17](https://github.com/mcarvin8/xml-disassembler/commit/31ecd1720a7cee8ad17f7e646b7b0354935d7b5d))

## [1.1.2](https://github.com/mcarvin8/xml-disassembler/compare/v1.1.1...v1.1.2) (2024-03-11)

### Bug Fixes

- copy XmlElement interface into reassemble file ([25e5599](https://github.com/mcarvin8/xml-disassembler/commit/25e559970d43693c36ecf336ce1523d689f1f235))
- revert class to use fast xml parser and move build nested elements function to class ([0febc42](https://github.com/mcarvin8/xml-disassembler/commit/0febc427270e185c28469b4bcfe748e302d73ac3))
- use buildNestedElements function with different starting indent level ([d611430](https://github.com/mcarvin8/xml-disassembler/commit/d6114306df7fafa2aea5491ef057f7121834e373))

## [1.1.2-beta.3](https://github.com/mcarvin8/xml-disassembler/compare/v1.1.2-beta.2...v1.1.2-beta.3) (2024-03-11)

### Bug Fixes

- use buildNestedElements function with different starting indent level ([d611430](https://github.com/mcarvin8/xml-disassembler/commit/d6114306df7fafa2aea5491ef057f7121834e373))

## [1.1.2-beta.2](https://github.com/mcarvin8/xml-disassembler/compare/v1.1.2-beta.1...v1.1.2-beta.2) (2024-03-11)

### Bug Fixes

- copy XmlElement interface into reassemble file ([25e5599](https://github.com/mcarvin8/xml-disassembler/commit/25e559970d43693c36ecf336ce1523d689f1f235))

## [1.1.2-beta.1](https://github.com/mcarvin8/xml-disassembler/compare/v1.1.1...v1.1.2-beta.1) (2024-03-10)

### Bug Fixes

- revert class to use fast xml parser and move build nested elements function to class ([0febc42](https://github.com/mcarvin8/xml-disassembler/commit/0febc427270e185c28469b4bcfe748e302d73ac3))

## [1.1.1](https://github.com/mcarvin8/xml-disassembler/compare/v1.1.0...v1.1.1) (2024-03-10)

### Bug Fixes

- move xmlParser constant ([628f826](https://github.com/mcarvin8/xml-disassembler/commit/628f8264c35d1c9494c6bde64ec1bb795672a2a3))
- revert reassemble class due to TS2307: Cannot find module '@src/helpers/types' ([74a3300](https://github.com/mcarvin8/xml-disassembler/commit/74a3300142cc7f60537e68964d32d4e3da062192))

## [1.1.1-beta.2](https://github.com/mcarvin8/xml-disassembler/compare/v1.1.1-beta.1...v1.1.1-beta.2) (2024-03-10)

### Bug Fixes

- revert reassemble class due to TS2307: Cannot find module '@src/helpers/types' ([74a3300](https://github.com/mcarvin8/xml-disassembler/commit/74a3300142cc7f60537e68964d32d4e3da062192))

## [1.1.1-beta.1](https://github.com/mcarvin8/xml-disassembler/compare/v1.1.0...v1.1.1-beta.1) (2024-03-10)

### Bug Fixes

- move xmlParser constant ([628f826](https://github.com/mcarvin8/xml-disassembler/commit/628f8264c35d1c9494c6bde64ec1bb795672a2a3))

# [1.1.0](https://github.com/mcarvin8/xml-disassembler/compare/v1.0.10...v1.1.0) (2024-03-10)

### Features

- rename `purge` flag to `prePurge` and add `postPurge` flag to disassemble class ([ff9fdc3](https://github.com/mcarvin8/xml-disassembler/commit/ff9fdc326aa745bdb0fcd88fb000de64e2624427))
- use fast xml parser for reassembly ([bf045a9](https://github.com/mcarvin8/xml-disassembler/commit/bf045a942e7a3d918999df8ff770255db2a5e785))

# [1.1.0-beta.1](https://github.com/mcarvin8/xml-disassembler/compare/v1.0.10...v1.1.0-beta.1) (2024-03-10)

### Features

- rename `purge` flag to `prePurge` and add `postPurge` flag to disassemble class ([ff9fdc3](https://github.com/mcarvin8/xml-disassembler/commit/ff9fdc326aa745bdb0fcd88fb000de64e2624427))
- use fast xml parser for reassembly ([bf045a9](https://github.com/mcarvin8/xml-disassembler/commit/bf045a942e7a3d918999df8ff770255db2a5e785))

## [1.0.10](https://github.com/mcarvin8/xml-disassembler/compare/v1.0.9...v1.0.10) (2024-03-07)

### Bug Fixes

- sort files based on name in root path ([f21c989](https://github.com/mcarvin8/xml-disassembler/commit/f21c989e29c08b7f32913a507cc2d1540feb8549))

## [1.0.10-beta.1](https://github.com/mcarvin8/xml-disassembler/compare/v1.0.9...v1.0.10-beta.1) (2024-03-07)

### Bug Fixes

- sort files based on name in root path ([f21c989](https://github.com/mcarvin8/xml-disassembler/commit/f21c989e29c08b7f32913a507cc2d1540feb8549))

## [1.0.9](https://github.com/mcarvin8/xml-disassembler/compare/v1.0.8...v1.0.9) (2024-03-07)

### Bug Fixes

- ensure root element name is not empty when disassembling ([41fdd6f](https://github.com/mcarvin8/xml-disassembler/commit/41fdd6f6b74d2665e0e62079cc5828513b7452b0))

## [1.0.8](https://github.com/mcarvin8/xml-disassembler/compare/v1.0.7...v1.0.8) (2024-03-07)

### Bug Fixes

- do not disassemble files if the file only has leaf elements ([ca9efbb](https://github.com/mcarvin8/xml-disassembler/commit/ca9efbb64958b128e031d78e752025c814932fd8))

## [1.0.7](https://github.com/mcarvin8/xml-disassembler/compare/v1.0.6...v1.0.7) (2024-03-04)

### Bug Fixes

- fix root element name check, improve logging messages to reach full code coverage ([9a4de6b](https://github.com/mcarvin8/xml-disassembler/commit/9a4de6b6bc91166d2e4af0f5ed7babf4d2b83dbf))

## [1.0.6](https://github.com/mcarvin8/xml-disassembler/compare/v1.0.5...v1.0.6) (2024-02-23)

### Bug Fixes

- configure logging with log4js ([65b106a](https://github.com/mcarvin8/xml-disassembler/commit/65b106afac9206c3db4a9ef352e3b08d2085b051))

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
