import { rename, unlink, rm, writeFile } from "node:fs/promises";
import { copy } from "fs-extra";
import { resolve } from "node:path";
import {
  DisassembleXMLFileHandler,
  ReassembleXMLFileHandler,
  setLogLevel,
  logger,
} from "../src/index";
import { compareDirectories } from "./helpers/compare";

setLogLevel("debug");
const sampleDir: string = "fixtures";
const mockDir: string = "mock-tag";
let disassembleHandler: DisassembleXMLFileHandler;
let reassembleHandler: ReassembleXMLFileHandler;

describe("grouped by tag strategy test suite", () => {
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

  it("should disassemble a general XML file (nested and leaf elements) with unique ID elements.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock-tag/general",
      strategy: "grouped-by-tag",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble a general XML file (nested and leaf elements) with a namespace and alternate file extension.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock-tag/general/HR_Admin",
      fileExtension: "permissionset-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble an XML file with attributes in the root element.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock-tag/attributes",
      strategy: "grouped-by-tag",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble an XML file with attributes in the root element", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock-tag/attributes/notes",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble a XML file with CDATA.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock-tag/cdata",
      strategy: "grouped-by-tag",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble a XML file with CDATA and use the default file extension.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock-tag/cdata/VidLand_US",
    });

    // rename file manually to confirm file is identical to baseline
    rename(
      "mock-tag/cdata/VidLand_US.xml",
      "mock-tag/cdata/VidLand_US.marketingappextension-meta.xml",
    );

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble a XML file with comments and an invalid unique ID element.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock-tag/comments",
      strategy: "grouped-by-tag",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble a XML file with comments.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock-tag/comments/Numbers-fr",
      fileExtension: "globalValueSetTranslation-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble a XML file with a deeply nested unique ID element.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock-tag/deeply-nested-unique-id-element",
      strategy: "grouped-by-tag",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble a XML file with a deeply nested unique ID element.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock-tag/deeply-nested-unique-id-element/Get_Info",
      fileExtension: "flow-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble a XML file with an array of leaf elements and no defined unique ID element.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock-tag/array-of-leaves",
      strategy: "grouped-by-tag",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble a XML file with an array of leaf elements and no defined unique ID element.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock-tag/array-of-leaves/Dreamhouse",
      fileExtension: "app-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should purge the existing disassembled directory before disassembling the file.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock-tag/array-of-leaves",
      strategy: "grouped-by-tag",
      prePurge: true,
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble the files from the previous test (prePurge) and delete the disassemble files afterwards.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock-tag/array-of-leaves/Dreamhouse",
      fileExtension: "app-meta.xml",
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble a XML file with no namespace.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock-tag/no-namespace/HR_Admin.permissionset-meta.xml",
      strategy: "grouped-by-tag",
    });

    // Delete the original file manaully to ensure false "postPurge" is tested
    // but ensure the file is recreated by the next test
    unlink("mock-tag/no-namespace/HR_Admin.permissionset-meta.xml");

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble a XML file with no namespace.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock-tag/no-namespace/HR_Admin",
      fileExtension: "permissionset-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should test disassemble error condition (XML file only has leaf elements).", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock-tag/no-nested-elements",
      strategy: "grouped-by-tag",
    });

    expect(logger.error).toHaveBeenCalled();
  });
  it("should test disassemble error condition (XML file path not provided).", async () => {
    let fakeFile = "mock-tag/not-an-xml.txt";
    fakeFile = resolve(fakeFile);
    const fakeFileContents = "Testing error condition.";
    await writeFile(fakeFile, fakeFileContents);
    await disassembleHandler.disassemble({
      filePath: fakeFile,
      strategy: "grouped-by-tag",
    });
    await rm(fakeFile);
    expect(logger.error).toHaveBeenCalled();
  });
  it("should test disassemble error condition (no root element in XML).", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock-tag/no-root-element",
      strategy: "grouped-by-tag",
    });

    expect(logger.error).toHaveBeenCalled();
  });
  // This should always be the final test
  it("should compare the files created in the mock directory against the baselines to confirm no changes.", async () => {
    await compareDirectories(sampleDir, mockDir);
  });
});
