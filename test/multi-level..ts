import { existsSync, promises as fs } from "fs";
import { join } from "path";
import { strictEqual } from "assert";
import {
  DisassembleXMLFileHandler,
  XmlElement,
  parseXML,
  buildXMLString,
  ReassembleXMLFileHandler,
} from "../src/index";
const testFile: string = "test/fixtures/Just_Shop.loyaltyProgramSetup-meta.xml";
let baselineContent: string;
let disassembleHandler: DisassembleXMLFileHandler;
let reassembleHandler: ReassembleXMLFileHandler;

describe("multi-level disassembly test suite", () => {
  beforeAll(async () => {
    disassembleHandler = new DisassembleXMLFileHandler();
    reassembleHandler = new ReassembleXMLFileHandler();
    baselineContent = await fs.readFile(testFile, "utf-8");
  });

  it("should disassemble a XML file multiple times by level", async () => {
    await disassembleHandler.disassemble({
      filePath: testFile,
      uniqueIdElements: "fullName,name,processName",
    });
    const filePath = "test/fixtures/Just_Shop";
    const disassembledDir = filePath.replace(/\.xml$/, "");

    const recursivelyDisassembleLoyaltyProgramSetup = async (
      dir: string,
    ): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          await recursivelyDisassembleLoyaltyProgramSetup(fullPath);
        } else if (entry.isFile() && fullPath.endsWith(".xml")) {
          // Add conditional handling for loyalty program-related nested files
          if (entry.name.includes("programProcesses-meta")) {
            await stripRootAndDisassemble(fullPath, disassembleHandler, "xml");
          }
        }
      }
    };

    if (existsSync(disassembledDir)) {
      await recursivelyDisassembleLoyaltyProgramSetup(disassembledDir);
    }
  });
  it("should reassemble the XML file over multiple levels.", async () => {
    await reassembleLoyaltyProgramSetup(
      "test/fixtures/Just_Shop",
      reassembleHandler,
    );
  });
  it("confirm the XML is the same as the baseline.", async () => {
    const testContent = await fs.readFile(testFile, "utf-8");
    strictEqual(
      testContent,
      baselineContent,
      "Mismatch between baseline and test file",
    );
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
  const stripped: XmlElement = {
    "?xml": {
      "@_version": "1.0",
      "@_encoding": "UTF-8",
    },
  };

  for (const [key, value] of Object.entries(contents)) {
    stripped[key] = value;
  }

  const newXml = buildXMLString(stripped);
  await fs.writeFile(fullPath, newXml, "utf-8");

  await handler.disassemble({
    filePath: fullPath,
    format,
    strategy: "unique-id",
    prePurge: false,
    postPurge: true,
    uniqueIdElements: "parameterName,ruleName",
  });
}

async function reassembleLoyaltyProgramSetup(
  basePath: string,
  handler: ReassembleXMLFileHandler,
): Promise<void> {
  const children = await fs.readdir(basePath, { withFileTypes: true });
  for (const entry of children) {
    if (!entry.isDirectory()) continue;
    const programProcessesPath = join(basePath, "programProcesses");

    if (!existsSync(programProcessesPath)) continue;

    const processEntries = await fs.readdir(programProcessesPath, {
      withFileTypes: true,
    });
    for (const processEntry of processEntries) {
      const processPath = join(programProcessesPath, processEntry.name);
      if (!processEntry.isDirectory()) continue; // Skip files (e.g. leaf-only XML not disassembled)
      const subDirs = await fs.readdir(processPath, { withFileTypes: true });

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

async function wrapAllFilesWithLoyaltyRoot(folderPath: string): Promise<void> {
  const files = await fs.readdir(folderPath);

  for (const file of files) {
    if (!file.endsWith(".xml")) continue;

    const xmlPath = join(folderPath, file);
    const statResult = await fs.stat(xmlPath);
    if (!statResult.isFile()) continue;

    const parsed = await parseXML(xmlPath);
    if (!parsed || typeof parsed !== "object") continue;

    if ("LoyaltyProgramSetup" in parsed) {
      // Already wrapped
      continue;
    }

    // Remove '?xml' declaration if it exists
    const rootKey = Object.keys(parsed).find((k) => k !== "?xml");
    if (!rootKey) continue;

    const wrapped: XmlElement = {
      "?xml": {
        "@_version": "1.0",
        "@_encoding": "UTF-8",
      },
      LoyaltyProgramSetup: {
        "@_xmlns": "http://soap.sforce.com/2006/04/metadata",
        [rootKey]: parsed[rootKey],
      },
    };

    const xmlString = buildXMLString(wrapped);
    await fs.writeFile(xmlPath, xmlString, "utf-8");
  }
}
