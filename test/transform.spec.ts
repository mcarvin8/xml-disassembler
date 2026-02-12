import { promises as fs } from "fs";
import { copy } from "fs-extra";

import {
  DisassembleXMLFileHandler,
  ReassembleXMLFileHandler,
} from "../src/index";
import { compareFiles } from "./helpers/compare";
const sampleDir: string = "fixtures";
const mockDir: string = "mock2";
let disassembleHandler: DisassembleXMLFileHandler;
let reassembleHandler: ReassembleXMLFileHandler;

describe("transform test suite", () => {
  beforeAll(async () => {
    await copy(sampleDir, mockDir, { overwrite: true });
    disassembleHandler = new DisassembleXMLFileHandler();
    reassembleHandler = new ReassembleXMLFileHandler();
  });

  afterAll(async () => {
    await fs.rm(mockDir, { recursive: true });
  });

  it("should disassemble a general XML file into JSON files", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock2/general",
      postPurge: true,
      prePurge: true,
      format: "json",
    });
  });
  it("should reassemble the JSON files back into the original XML.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock2/general/HR_Admin",
      fileExtension: "permissionset-meta.xml",
    });
  });
  it("should compare the reassembled XML from JSON files against the baseline.", async () => {
    await compareFiles(
      "fixtures/general/HR_Admin.permissionset-meta.xml",
      "mock2/general/HR_Admin.permissionset-meta.xml",
    );
  });
  it("should disassemble a general XML file into JSON5 files", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock2/general",
      postPurge: true,
      prePurge: true,
      format: "json5",
    });
  });
  it("should reassemble the JSON5 files back into the original XML.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock2/general/HR_Admin",
      fileExtension: "permissionset-meta.xml",
    });
  });
  it("should compare the reassembled XML from JSON5 files against the baseline.", async () => {
    await compareFiles(
      "fixtures/general/HR_Admin.permissionset-meta.xml",
      "mock2/general/HR_Admin.permissionset-meta.xml",
    );
  });
  it("should disassemble a general XML file into YAML files", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock2/general",
      postPurge: true,
      prePurge: true,
      format: "yaml",
    });
  });
  it("should reassemble the YAML files back into the original XML.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock2/general/HR_Admin",
      fileExtension: "permissionset-meta.xml",
    });
  });
  it("should compare the reassembled XML from YAML files against the baseline.", async () => {
    await compareFiles(
      "fixtures/general/HR_Admin.permissionset-meta.xml",
      "mock2/general/HR_Admin.permissionset-meta.xml",
    );
  });
  it("should disassemble a general XML file into JSON files with the group tag strategy", async () => {
    await disassembleHandler.disassemble({
      filePath: "mock2/general",
      strategy: "grouped-by-tag",
      postPurge: true,
      prePurge: true,
      format: "json",
    });
  });
  it("should reassemble the JSON files with the group tag strategy back into the original XML.", async () => {
    await reassembleHandler.reassemble({
      filePath: "mock2/general/HR_Admin",
      fileExtension: "permissionset-meta.xml",
    });
  });
  it("should compare the reassembled XML from JSON files with the group tag strategy against the baseline.", async () => {
    await compareFiles(
      "fixtures/general/HR_Admin.permissionset-meta.xml",
      "mock2/general/HR_Admin.permissionset-meta.xml",
    );
  });
});
