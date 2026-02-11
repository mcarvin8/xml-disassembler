import { promises as fs } from "fs";
import { strictEqual } from "assert";
import { copy } from "fs-extra";
import {
  DisassembleXMLFileHandler,
  ReassembleXMLFileHandler,
} from "../src/index";

const fixtureDir = "fixtures/split-tags";
const baselineFile = `${fixtureDir}/HR_Admin.permissionset-meta.xml`;
const mockDir = "mock-split-tags";
const testFile = `${mockDir}/HR_Admin.permissionset-meta.xml`;
const basePath = `${mockDir}/HR_Admin`;

// Same as CLI: --strategy grouped-by-tag -p "objectPermissions:split:object,fieldPermissions:group:field"
const SPLIT_TAGS_SPEC =
  "objectPermissions:split:object,fieldPermissions:group:field";

let baselineContent: string;
let disassembleHandler: DisassembleXMLFileHandler;
let reassembleHandler: ReassembleXMLFileHandler;

describe("split-tags disassembly test suite", () => {
  beforeAll(async () => {
    await copy(fixtureDir, mockDir, { overwrite: true });
    disassembleHandler = new DisassembleXMLFileHandler();
    reassembleHandler = new ReassembleXMLFileHandler();
    baselineContent = await fs.readFile(baselineFile, "utf-8");
  });

  afterAll(async () => {
    await fs.rm(mockDir, { recursive: true, force: true });
  });

  it("should disassemble with grouped-by-tag and splitTags in one call", async () => {
    await disassembleHandler.disassemble({
      filePath: testFile,
      strategy: "grouped-by-tag",
      splitTags: SPLIT_TAGS_SPEC,
      postPurge: true,
    });
  });

  it("should reassemble the directory in one call", async () => {
    await reassembleHandler.reassemble({
      filePath: basePath,
      fileExtension: "permissionset-meta.xml",
      postPurge: true,
    });
  });

  it("should match the baseline fixture after round-trip", async () => {
    const testContent = await fs.readFile(testFile, "utf-8");
    strictEqual(
      testContent,
      baselineContent,
      "Reassembled XML must match the original fixture exactly",
    );
  });
});
