import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { readdir, writeFile, rm, stat } from "node:fs/promises";
import {
  DisassembleXMLFileHandler,
  setLogLevel,
  logger,
  XmlElement,
  parseXML,
  transformToIni,
  transformToJson,
  transformToJson5,
  transformToToml,
  transformToYaml,
  buildXMLString,
  ReassembleXMLFileHandler,
} from "../src/index";

import { XML_DEFAULT_DECLARATION } from "../src/constants/constants";

setLogLevel("debug");
const testFile: string = "test/Just_Shop.loyaltyProgramSetup-meta.xml";
let disassembleHandler: DisassembleXMLFileHandler;
let reassembleHandler: ReassembleXMLFileHandler;

describe("multi-level disassembly test suite", () => {
  beforeAll(async () => {
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

  it("should disassemble a XML file multiple times by level", async () => {
    await disassembleHandler.disassemble({
      filePath: testFile,
      uniqueIdElements: "fullName,name,processName",
    });
    const filePath = "test/Just_Shop";
    const disassembledDir = filePath.replace(/\.xml$/, "");

    const recursivelyDisassembleLoyaltyProgramSetup = async (
      dir: string,
    ): Promise<void> => {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          await recursivelyDisassembleLoyaltyProgramSetup(fullPath);
        } else if (entry.isFile() && fullPath.endsWith(".xml")) {
          // Add conditional handling for loyalty program-related nested files
          if (entry.name.includes("programProcesses-meta")) {
            await stripRootAndDisassemble(fullPath, disassembleHandler, "xml");
          } else if (
            dirname(fullPath) !== filePath &&
            fullPath.endsWith(".xml")
          ) {
            await transformAndCleanup(fullPath, "xml");
          }
        }
      }
    };

    if (existsSync(disassembledDir)) {
      await recursivelyDisassembleLoyaltyProgramSetup(disassembledDir);
    }
    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble the XML file over multiple levels.", async () => {
    await reassembleLoyaltyProgramSetup("test/Just_Shop", reassembleHandler);
    expect(logger.error).not.toHaveBeenCalled();
  });
});

async function stripRootAndDisassemble(
  fullPath: string,
  handler: DisassembleXMLFileHandler,
  format: string,
): Promise<void> {
  const parsed = await parseXML(fullPath);
  const contents = parsed?.LoyaltyProgramSetup;

  if (!contents) return;

  // Remove the root and build XML with just the inner nodes (programProcesses)
  const stripped: XmlElement = {};

  for (const [key, value] of Object.entries(contents)) {
    stripped[key] = value;
  }

  const newXml = buildXMLString(stripped);
  await writeFile(fullPath, `${XML_DEFAULT_DECLARATION}\n${newXml}`, "utf-8");

  await handler.disassemble({
    filePath: fullPath,
    format,
    strategy: "unique-id",
    prePurge: false,
    postPurge: true,
    uniqueIdElements: "parameterName,ruleName",
  });
}

async function transformAndCleanup(
  filePath: string,
  format: string,
): Promise<void> {
  switch (format) {
    case "json":
      await transformToJson(filePath);
      break;
    case "yaml":
      await transformToYaml(filePath);
      break;
    case "json5":
      await transformToJson5(filePath);
      break;
    case "ini":
      await transformToIni(filePath);
      break;
    case "toml":
      await transformToToml(filePath);
      break;
    default:
      return; // Skip if 'xml' or unknown
  }
  await rm(filePath, { force: true });
}

async function reassembleLoyaltyProgramSetup(
  basePath: string,
  handler: ReassembleXMLFileHandler,
): Promise<void> {
  const children = await readdir(basePath, { withFileTypes: true });
  for (const entry of children) {
    if (!entry.isDirectory()) continue;
    const programProcessesPath = join(basePath, "programProcesses");

    if (!existsSync(programProcessesPath)) continue;

    const processDirs = await readdir(programProcessesPath);
    for (const process of processDirs) {
      const processPath = join(programProcessesPath, process);
      const subDirs = await readdir(processPath, { withFileTypes: true });

      for (const subDir of subDirs) {
        if (subDir.isDirectory()) {
          await handler.reassemble({
            filePath: join(processPath, subDir.name),
            fileExtension: "xml",
            postPurge: true,
          });
        }
      }

      await handler.reassemble({
        filePath: processPath,
        fileExtension: "xml",
        postPurge: true,
      });
    }

    await wrapAllFilesWithLoyaltyRoot(programProcessesPath);
    await handler.reassemble({
      filePath: basePath,
      fileExtension: "loyaltyProgramSetup-meta.xml",
      postPurge: true,
    });
  }
}

function stripXmlDeclarationFromString(xml: string): string {
  return xml.replace(/<\?xml.*?\?>\s*/g, "").trim();
}

export async function wrapAllFilesWithLoyaltyRoot(
  folderPath: string,
): Promise<void> {
  const files = await readdir(folderPath);

  for (const file of files) {
    if (!file.endsWith(".xml")) continue;

    const xmlPath = join(folderPath, file);
    const statResult = await stat(xmlPath);
    if (!statResult.isFile()) continue;

    const parsed = await parseXML(xmlPath);
    if (!parsed || typeof parsed !== "object") continue;

    if ("LoyaltyProgramSetup" in parsed) {
      // Already wrapped
      continue;
    }

    const wrapped: XmlElement = {
      LoyaltyProgramSetup: {
        "@_xmlns": "http://soap.sforce.com/2006/04/metadata",
        ...parsed,
      },
    };

    const xmlString = buildXMLString(wrapped);
    const cleanXmlString = stripXmlDeclarationFromString(xmlString);
    await writeFile(
      xmlPath,
      `${XML_DEFAULT_DECLARATION}\n${cleanXmlString}`,
      "utf-8",
    );
  }
}
