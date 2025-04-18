import {
  rename,
  readdir,
  unlink,
  writeFile,
  rm,
  readFile,
} from "node:fs/promises";
import { strictEqual } from "node:assert";
import { join, resolve } from "node:path/posix";
import { copy } from "fs-extra";

import {
  DisassembleXMLFileHandler,
  ReassembleXMLFileHandler,
  setLogLevel,
  logger,
  parseXML,
  buildXMLString,
  XmlElement,
} from "../src/index";

setLogLevel("debug");
const sampleDir: string = "samples";
const mockDir: string = "mock";
let disassembleHandler: DisassembleXMLFileHandler;
let reassembleHandler: ReassembleXMLFileHandler;

describe("main test suite", () => {
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

  it('should disassemble a general XML file (nested and leaf elements) with unique ID elements."', async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/general",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it('should reassemble a general XML file (nested and leaf elements) with a namespace and alternate file extension."', async () => {
    await reassembleHandler.reassemble({
      filePath: "mock/general/HR_Admin",
      fileExtension: "permissionset-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble an XML file with attributes in the root element.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/attributes",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble an XML file with attributes in the root element", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock/attributes/notes",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble a XML file with CDATA.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/cdata",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble a XML file with CDATA and use the default file extension.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock/cdata/VidLand_US",
    });

    // rename file manually to confirm file is identical to baseline
    rename(
      "mock/cdata/VidLand_US.xml",
      "mock/cdata/VidLand_US.marketingappextension-meta.xml",
    );

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble a XML file with comments and an invalid unique ID element.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/comments",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble a XML file with comments.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock/comments/Numbers-fr",
      fileExtension: "globalValueSetTranslation-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble a XML file with a deeply nested unique ID element.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/deeply-nested-unique-id-element",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble a XML file with a deeply nested unique ID element.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock/deeply-nested-unique-id-element/Get_Info",
      fileExtension: "flow-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble a XML file with an array of leaf elements and no defined unique ID element.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/array-of-leafs",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble a XML file with an array of leaf elements and no defined unique ID element.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock/array-of-leafs/Dreamhouse",
      fileExtension: "app-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should purge the existing disassembled directory before disassembling the file.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/array-of-leafs",
      prePurge: true,
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble the files from the previous test (prePurge) and delete the disassemble files afterwards.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock/array-of-leafs/Dreamhouse",
      fileExtension: "app-meta.xml",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble a XML file with no namespace.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/no-namespace/HR_Admin.permissionset-meta.xml",
    });

    // Delete the original file manaully to ensure false "postPurge" is tested
    // but ensure the file is recreated by the next test
    unlink("mock/no-namespace/HR_Admin.permissionset-meta.xml");

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble a XML file with no namespace.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock/no-namespace/HR_Admin",
      fileExtension: "permissionset-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should test disassemble error condition (XML file path not provided).", async () => {
    let fakeFile = "mock/not-an-xml.txt";
    fakeFile = resolve(fakeFile);
    const fakeFileContents = "Testing error condition.";
    await writeFile(fakeFile, fakeFileContents);
    await disassembleHandler.disassemble({
      filePath: fakeFile,
    });
    await rm(fakeFile);
    expect(logger.error).toHaveBeenCalled();
  });
  it("should test reassemble error condition (file path provided).", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock/no-namespace/HR_Admin/HR_Admin.permissionset-meta.xml",
    });

    expect(logger.error).toHaveBeenCalled();
  });
  it("should test disassemble error condition (no root element in XML).", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/no-root-element",
    });

    expect(logger.error).toHaveBeenCalled();
  });
  it("should test reassemble error condition (no root element in XML).", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock/no-root-element/Assessment_Bot",
    });

    expect(logger.error).toHaveBeenCalled();
  });
  it("should test disassemble error condition (XML file only has leaf elements).", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/no-nested-elements",
    });

    expect(logger.error).toHaveBeenCalled();
  });
  it("should test ignore file warning condition using a folder-path.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/ignore",
    });

    expect(logger.warn).toHaveBeenCalled();
  });
  it("should test ignore file warning condition using a file-path.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/ignore/HR_Admin.permissionset-meta.xml",
    });

    expect(logger.warn).toHaveBeenCalled();
  });
  it("should test parsing and building an XML with the exported functions.", async () => {
    const result = await parseXML(
      "mock/ignore/HR_Admin.permissionset-meta.xml",
    );
    await buildXMLString(result as XmlElement);

    expect(logger.error).not.toHaveBeenCalled();
  });
  // This should always be the final test
  it("should compare the files created in the mock directory against the baselines to confirm no changes.", async () => {
    await compareDirectories(sampleDir, mockDir);
  });
});

async function compareDirectories(
  referenceDir: string,
  mockDir: string,
): Promise<void> {
  const entriesinRef = await readdir(referenceDir, { withFileTypes: true });

  // Only compare files that are in the reference directory
  for (const entry of entriesinRef) {
    const refEntryPath = join(referenceDir, entry.name);
    const mockPath = join(mockDir, entry.name);

    if (entry.isDirectory()) {
      // If it's a directory, recursively compare its contents
      await compareDirectories(refEntryPath, mockPath);
    } else {
      // If it's a file, compare its content
      const refContent = await readFile(refEntryPath, "utf-8");
      const mockContent = await readFile(mockPath, "utf-8");
      strictEqual(
        mockContent,
        refContent,
        `File content is different for ${entry.name}`,
      );
    }
  }
}
