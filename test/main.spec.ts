import {
  rename,
  readdir,
  unlink,
  writeFile,
  rm,
  readFile,
} from "node:fs/promises";
import { strictEqual } from "node:assert";
import { join, resolve } from "node:path";
import { copy } from "fs-extra";

import {
  DisassembleXMLFileHandler,
  ReassembleXMLFileHandler,
  setLogLevel,
  logger,
} from "../src/index";

setLogLevel("debug");
const baselineDir: string = "test/baselines";
const mockDir: string = "mock";
let disassembleHandler: DisassembleXMLFileHandler;
let reassembleHandler: ReassembleXMLFileHandler;

describe("main function", () => {
  beforeAll(async () => {
    await copy(baselineDir, mockDir, { overwrite: true });
    disassembleHandler = new DisassembleXMLFileHandler();
    reassembleHandler = new ReassembleXMLFileHandler();
  });

  beforeEach(async () => {
    jest.spyOn(console, "log");
    jest.spyOn(logger, "debug");
    jest.spyOn(logger, "error");
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await rm(mockDir, { recursive: true });
  });

  it('should disassemble a general XML file (nested and leaf elements) with unique ID elements."', async () => {
    await disassembleHandler.disassemble({
      xmlPath: "mock/general",
      uniqueIdElements:
        "application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it('should reassemble a general XML file (nested and leaf elements) with a namespace and alternate file extension."', async () => {
    await reassembleHandler.reassemble({
      xmlPath: "mock/general/HR_Admin",
      fileExtension: "permissionset-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble an XML file with attributes in the root element.", async () => {
    await disassembleHandler.disassemble({
      xmlPath: "mock/attributes",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble an XML file with attributes in the root element", async () => {
    await reassembleHandler.reassemble({
      xmlPath: "mock/attributes/notes",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble a XML file with CDATA.", async () => {
    await disassembleHandler.disassemble({
      xmlPath: "mock/cdata",
      uniqueIdElements: "apiName",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble a XML file with CDATA and use the default file extension.", async () => {
    await reassembleHandler.reassemble({
      xmlPath: "mock/cdata/VidLand_US",
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
      xmlPath: "mock/comments",
      uniqueIdElements: "invalid",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble a XML file with comments.", async () => {
    await reassembleHandler.reassemble({
      xmlPath: "mock/comments/Numbers-fr",
      fileExtension: "globalValueSetTranslation-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble a XML file with a deeply nested unique ID element.", async () => {
    await disassembleHandler.disassemble({
      xmlPath: "mock/deeply-nested-unique-id-element",
      uniqueIdElements:
        "apexClass,name,object,field,layout,actionName,targetReference,assignToReference,choiceText,promptText",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble a XML file with a deeply nested unique ID element.", async () => {
    await reassembleHandler.reassemble({
      xmlPath: "mock/deeply-nested-unique-id-element/Get_Info",
      fileExtension: "flow-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble a XML file with an array of leaf elements and no defined unique ID element.", async () => {
    await disassembleHandler.disassemble({
      xmlPath: "mock/array-of-leafs",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble a XML file with an array of leaf elements and no defined unique ID element.", async () => {
    await reassembleHandler.reassemble({
      xmlPath: "mock/array-of-leafs/Dreamhouse",
      fileExtension: "app-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should purge the existing disassembled directory before disassembling the file.", async () => {
    await disassembleHandler.disassemble({
      xmlPath: "mock/array-of-leafs",
      prePurge: true,
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble the files from the previous test (prePurge) and delete the disassemble files afterwards.", async () => {
    await reassembleHandler.reassemble({
      xmlPath: "mock/array-of-leafs/Dreamhouse",
      fileExtension: "app-meta.xml",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble a XML file with no namespace.", async () => {
    await disassembleHandler.disassemble({
      xmlPath: "mock/no-namespace/HR_Admin.permissionset-meta.xml",
      uniqueIdElements:
        "application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field",
    });

    // Delete the original file manaully to ensure false "postPurge" is tested
    // but ensure the file is recreated by the next test
    unlink("mock/no-namespace/HR_Admin.permissionset-meta.xml");

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble a XML file with no namespace.", async () => {
    await reassembleHandler.reassemble({
      xmlPath: "mock/no-namespace/HR_Admin",
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
      xmlPath: fakeFile,
    });
    await rm(fakeFile);
    expect(logger.error).toHaveBeenCalled();
  });
  it("should test reassemble error condition (file path provided).", async () => {
    await reassembleHandler.reassemble({
      xmlPath: "mock/no-namespace/HR_Admin/HR_Admin.permissionset-meta.xml",
    });

    expect(logger.error).toHaveBeenCalled();
  });
  it("should test disassemble error condition (no root element in XML).", async () => {
    await disassembleHandler.disassemble({
      xmlPath: "mock/no-root-element",
    });

    expect(logger.error).toHaveBeenCalled();
  });
  it("should test reassemble error condition (no root element in XML).", async () => {
    await reassembleHandler.reassemble({
      xmlPath: "mock/no-root-element/Assessment_Bot",
    });

    expect(logger.error).toHaveBeenCalled();
  });
  it("should test disassemble error condition (XML file only has leaf elements).", async () => {
    await disassembleHandler.disassemble({
      xmlPath: "mock/no-nested-elements",
    });

    expect(logger.error).toHaveBeenCalled();
  });
  // This should always be the final test
  it("should compare the files created in the mock directory against the baselines to confirm no changes.", async () => {
    await compareDirectories(baselineDir, mockDir);
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
        refContent,
        mockContent,
        `File content is different for ${entry.name}`,
      );
    }
  }
}
