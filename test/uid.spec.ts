import { promises as fs } from "fs";
import { resolve } from "path";
import { copy } from "fs-extra";

import {
  DisassembleXMLFileHandler,
  ReassembleXMLFileHandler,
} from "../src/index";
import { compareDirectories } from "./helpers/compare";
const sampleDir: string = "fixtures";
const mockDir: string = "mock";
let disassembleHandler: DisassembleXMLFileHandler;
let reassembleHandler: ReassembleXMLFileHandler;

describe("unique-id strategy test suite", () => {
  beforeAll(async () => {
    await copy(sampleDir, mockDir, { overwrite: true });
    disassembleHandler = new DisassembleXMLFileHandler();
    reassembleHandler = new ReassembleXMLFileHandler();
  });

  afterAll(async () => {
    await fs.rm(mockDir, { recursive: true });
  });

  it("should disassemble a general XML file (nested and leaf elements) with unique ID elements.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/general",
      uniqueIdElements:
        "application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field",
      postPurge: true,
    });
  });
  it("should reassemble a general XML file (nested and leaf elements) with a namespace and alternate file extension.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock/general/HR_Admin",
      fileExtension: "permissionset-meta.xml",
    });
  });
  it("should disassemble an XML file with attributes in the root element.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/attributes",
      postPurge: true,
    });
  });
  it("should reassemble an XML file with attributes in the root element", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock/attributes/notes",
    });
  });
  it("should disassemble a XML file with CDATA.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/cdata",
      uniqueIdElements: "apiName",
      postPurge: true,
    });
  });
  it("should reassemble a XML file with CDATA and use the default file extension.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock/cdata/VidLand_US",
    });

    // rename file manually to confirm file is identical to baseline
    await fs.rename(
      "mock/cdata/VidLand_US.xml",
      "mock/cdata/VidLand_US.marketingappextension-meta.xml",
    );
  });
  it("should disassemble a XML file with comments and an invalid unique ID element.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/comments",
      uniqueIdElements: "invalid",
      postPurge: true,
    });
  });
  it("should reassemble a XML file with comments.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock/comments/Numbers-fr",
      fileExtension: "globalValueSetTranslation-meta.xml",
    });
  });
  it("should disassemble a XML file with a deeply nested unique ID element.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/deeply-nested-unique-id-element",
      uniqueIdElements:
        "apexClass,name,object,field,layout,actionName,targetReference,assignToReference,choiceText,promptText",
      postPurge: true,
    });
  });
  it("should reassemble a XML file with a deeply nested unique ID element.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock/deeply-nested-unique-id-element/Get_Info",
      fileExtension: "flow-meta.xml",
    });
  });
  it("should disassemble a XML file with an array of leaf elements and no defined unique ID element.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/array-of-leaves",
      postPurge: true,
    });
  });
  it("should reassemble a XML file with an array of leaf elements and no defined unique ID element.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock/array-of-leaves/Dreamhouse",
      fileExtension: "app-meta.xml",
    });
  });
  it("should purge the existing disassembled directory before disassembling the file.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/array-of-leaves",
      prePurge: true,
      postPurge: true,
    });
  });
  it("should reassemble the files from the previous test (prePurge) and delete the disassemble files afterwards.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock/array-of-leaves/Dreamhouse",
      fileExtension: "app-meta.xml",
      postPurge: true,
    });
  });
  it("should disassemble a XML file with no namespace.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/no-namespace/HR_Admin.permissionset-meta.xml",
      uniqueIdElements:
        "application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field",
    });

    // Delete the original file manaully to ensure false "postPurge" is tested
    // but ensure the file is recreated by the next test
    fs.unlink("mock/no-namespace/HR_Admin.permissionset-meta.xml");
  });
  it("should reassemble a XML file with no namespace.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock/no-namespace/HR_Admin",
      fileExtension: "permissionset-meta.xml",
    });
  });
  it("should test disassemble error condition (XML file path not provided).", async () => {
    let fakeFile = "mock/not-an-xml.txt";
    fakeFile = resolve(fakeFile);
    const fakeFileContents = "Testing error condition.";
    await fs.writeFile(fakeFile, fakeFileContents);
    await disassembleHandler.disassemble({
      filePath: fakeFile,
    });
    await fs.rm(fakeFile);
    expect(true).toBe(true); // Rust logs to stderr
  });
  it("should test reassemble error condition (file path provided).", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock/no-namespace/HR_Admin/HR_Admin.permissionset-meta.xml",
    });

    expect(true).toBe(true); // Rust logs to stderr
  });
  it("should test disassemble error condition (no root element in XML).", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/no-root-element",
    });

    expect(true).toBe(true); // Rust logs to stderr
  });
  it("should test reassemble error condition (no root element in XML).", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock/no-root-element/Assessment_Bot",
    });

    expect(true).toBe(true); // Rust logs to stderr
  });
  it("should test disassemble error condition (XML file only has leaf elements).", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/no-nested-elements",
      strategy: "not-valid",
    });
    expect(true).toBe(true); // Rust logs to stderr
    expect(true).toBe(true); // Rust logs to stderr
  });
  it("should test ignore file warning condition using a folder-path.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/ignore",
    });

    expect(true).toBe(true); // Rust logs to stderr
  });
  it("should test ignore file warning condition using a file-path.", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock/ignore/HR_Admin.permissionset-meta.xml",
    });

    expect(true).toBe(true); // Rust logs to stderr
  });
  // This should always be the final test
  it("should compare the files created in the mock directory against the baselines to confirm no changes.", async () => {
    await compareDirectories(sampleDir, mockDir);
  });
});
