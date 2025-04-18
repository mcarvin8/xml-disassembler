import { rm, readFile } from "node:fs/promises";
import { strictEqual } from "node:assert";
import { copy } from "fs-extra";

import {
  DisassembleXMLFileHandler,
  ReassembleXMLFileHandler,
  setLogLevel,
  logger,
} from "../src/index";

setLogLevel("debug");
const sampleDir: string = "samples";
const mockDir: string = "mock2";
let disassembleHandler: DisassembleXMLFileHandler;
let reassembleHandler: ReassembleXMLFileHandler;

describe("transform test suite", () => {
  beforeAll(async () => {
    await copy(sampleDir, mockDir, { overwrite: true });
    disassembleHandler = new DisassembleXMLFileHandler();
    reassembleHandler = new ReassembleXMLFileHandler();
  });

  beforeEach(async () => {
    jest.spyOn(logger, "debug");
    jest.spyOn(logger, "error");
    jest.spyOn(logger, "warn");
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await rm(mockDir, { recursive: true });
  });

  it('should disassemble a general XML file into JSON files"', async () => {
    await disassembleHandler.disassemble({
      filePath: "mock2/general",
      postPurge: true,
      prePurge: true,
      format: "json",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it('should reassemble the JSON files back into the original XML."', async () => {
    await reassembleHandler.reassemble({
      filePath: "mock2/general/HR_Admin",
      fileExtension: "permissionset-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should compare the reassembled XML from JSON files against the baseline.", async () => {
    await compareFiles(
      "samples/general/HR_Admin.permissionset-meta.xml",
      "mock2/general/HR_Admin.permissionset-meta.xml",
    );
  });
  it('should disassemble a general XML file into JSON5 files"', async () => {
    await disassembleHandler.disassemble({
      filePath: "mock2/general",
      postPurge: true,
      prePurge: true,
      format: "json5",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it('should reassemble the JSON5 files back into the original XML."', async () => {
    await reassembleHandler.reassemble({
      filePath: "mock2/general/HR_Admin",
      fileExtension: "permissionset-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should compare the reassembled XML from JSON5 files against the baseline.", async () => {
    await compareFiles(
      "samples/general/HR_Admin.permissionset-meta.xml",
      "mock2/general/HR_Admin.permissionset-meta.xml",
    );
  });
  it('should disassemble a general XML file into YAML files"', async () => {
    await disassembleHandler.disassemble({
      filePath: "mock2/general",
      postPurge: true,
      prePurge: true,
      format: "yaml",
    });
    expect(logger.error).not.toHaveBeenCalled();
  });
  it('should reassemble the YAML files back into the original XML."', async () => {
    await reassembleHandler.reassemble({
      filePath: "mock2/general/HR_Admin",
      fileExtension: "permissionset-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should compare the reassembled XML from YAML files against the baseline.", async () => {
    await compareFiles(
      "samples/general/HR_Admin.permissionset-meta.xml",
      "mock2/general/HR_Admin.permissionset-meta.xml",
    );
  });
  it('should disassemble a general XML file into TOML files"', async () => {
    await disassembleHandler.disassemble({
      filePath: "mock2/general",
      postPurge: true,
      prePurge: true,
      format: "toml",
    });
    expect(logger.error).not.toHaveBeenCalled();
  });
  it('should reassemble the TOML files back into the original XML."', async () => {
    await reassembleHandler.reassemble({
      filePath: "mock2/general/HR_Admin",
      fileExtension: "permissionset-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should compare the reassembled XML from TOML files against the baseline.", async () => {
    await compareFiles(
      "samples/general/HR_Admin.permissionset-meta.xml",
      "mock2/general/HR_Admin.permissionset-meta.xml",
    );
  });
  it('should disassemble a general XML file into INI files"', async () => {
    await disassembleHandler.disassemble({
      filePath: "mock2/general",
      postPurge: true,
      prePurge: true,
      format: "ini",
    });
    expect(logger.error).not.toHaveBeenCalled();
  });
  it('should reassemble the INI files back into the original XML."', async () => {
    await reassembleHandler.reassemble({
      filePath: "mock2/general/HR_Admin",
      fileExtension: "permissionset-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should compare the reassembled XML from INI files against the baseline.", async () => {
    await compareFiles(
      "samples/general/HR_Admin.permissionset-meta.xml",
      "mock2/general/HR_Admin.permissionset-meta.xml",
    );
  });
  it('should disassemble a general XML file into JSON files with the group tag strategy"', async () => {
    await disassembleHandler.disassemble({
      filePath: "mock2/general",
      strategy: "grouped-by-tag",
      postPurge: true,
      prePurge: true,
      format: "json",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it('should reassemble the JSON files with the group tag strategy back into the original XML."', async () => {
    await reassembleHandler.reassemble({
      filePath: "mock2/general/HR_Admin",
      fileExtension: "permissionset-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should compare the reassembled XML from JSON files with the group tag strategy against the baseline.", async () => {
    await compareFiles(
      "samples/general/HR_Admin.permissionset-meta.xml",
      "mock2/general/HR_Admin.permissionset-meta.xml",
    );
  });
});

async function compareFiles(
  refEntryPath: string,
  mockPath: string,
): Promise<void> {
  const refContent = await readFile(refEntryPath, "utf-8");
  const mockContent = await readFile(mockPath, "utf-8");
  strictEqual(mockContent, refContent, `File content is different }`);
}
