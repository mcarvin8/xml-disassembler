import { promises as fs } from "fs";
import { strictEqual } from "assert";
import { copy } from "fs-extra";
import {
  DisassembleXMLFileHandler,
  ReassembleXMLFileHandler,
} from "../src/index";

const fixtureDir = "fixtures/multi-level";
const baselineFile = `${fixtureDir}/Cloud_Kicks_Inner_Circle.loyaltyProgramSetup-meta.xml`;
const mockDir = "mock-multi-level";
const testFile = `${mockDir}/Cloud_Kicks_Inner_Circle.loyaltyProgramSetup-meta.xml`;
const basePath = `${mockDir}/Cloud_Kicks_Inner_Circle`;

// Same as CLI: --unique-id-elements "fullName,name,processName" --multi-level "programProcesses:programProcesses:parameterName,ruleName"
const MULTI_LEVEL_SPEC =
  "programProcesses:programProcesses:parameterName,ruleName";

let baselineContent: string;
let disassembleHandler: DisassembleXMLFileHandler;
let reassembleHandler: ReassembleXMLFileHandler;

describe("multi-level disassembly test suite", () => {
  beforeAll(async () => {
    await copy(fixtureDir, mockDir, { overwrite: true });
    disassembleHandler = new DisassembleXMLFileHandler();
    reassembleHandler = new ReassembleXMLFileHandler();
    baselineContent = await fs.readFile(baselineFile, "utf-8");
  });

  afterAll(async () => {
    await fs.rm(mockDir, { recursive: true, force: true });
  });

  it("should disassemble with multi-level in one call", async () => {
    await disassembleHandler.disassemble({
      filePath: testFile,
      uniqueIdElements: "fullName,name,processName",
      multiLevel: MULTI_LEVEL_SPEC,
      postPurge: true,
    });
  });

  it("should reassemble the directory in one call", async () => {
    await reassembleHandler.reassemble({
      filePath: basePath,
      fileExtension: "loyaltyProgramSetup-meta.xml",
      postPurge: true,
    });
  });

  it("should match the baseline after round-trip", async () => {
    const testContent = await fs.readFile(testFile, "utf-8");
    strictEqual(
      testContent,
      baselineContent,
      "Reassembled XML must match the original fixture",
    );
  });
});
