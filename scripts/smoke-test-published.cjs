/**
 * Smoke test for the published xml-disassembler npm package.
 * Uses fixtures/deeply-nested-unique-id-element/Get_Info.flow-meta.xml.
 * Run from a directory where `npm install xml-disassembler` has been run.
 * Usage: node path/to/smoke-test-published.cjs
 */
const path = require("path");
const fs = require("fs");
const os = require("os");
const { strictEqual } = require("assert");

const {
  parseXML,
  buildXMLString,
  DisassembleXMLFileHandler,
  ReassembleXMLFileHandler,
} = require("xml-disassembler");

const UNIQUE_ID_ELEMENTS =
  "apexClass,name,object,field,layout,actionName,targetReference,assignToReference,choiceText,promptText";

async function main() {
  const fixtureDir = path.join(
    __dirname,
    "..",
    "fixtures",
    "deeply-nested-unique-id-element",
  );
  const fixtureFile = path.join(fixtureDir, "Get_Info.flow-meta.xml");
  if (!fs.existsSync(fixtureFile)) {
    throw new Error("Fixture not found: " + fixtureFile);
  }
  const originalContent = fs.readFileSync(fixtureFile, "utf8");

  const tmpDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "xml-disassembler-smoke-"),
  );
  const tmpFixtureDir = path.join(tmpDir, "deeply-nested-unique-id-element");
  fs.mkdirSync(tmpFixtureDir, { recursive: true });
  fs.copyFileSync(
    fixtureFile,
    path.join(tmpFixtureDir, "Get_Info.flow-meta.xml"),
  );

  try {
    // Parse + build round-trip (validates native addon and core API)
    const xmlPath = path.join(tmpFixtureDir, "Get_Info.flow-meta.xml");
    const parsed = await parseXML(xmlPath);
    if (!parsed) throw new Error("parseXML returned undefined");
    const rebuilt = buildXMLString(parsed);
    if (!rebuilt || !rebuilt.includes("Flow"))
      throw new Error("buildXMLString failed");

    // Disassemble + reassemble using deeply-nested fixture and unique ID elements
    const handler = new DisassembleXMLFileHandler();
    handler.disassemble({
      filePath: tmpFixtureDir,
      uniqueIdElements: UNIQUE_ID_ELEMENTS,
      strategy: "unique-id",
      format: "xml",
    });
    const reassembleHandler = new ReassembleXMLFileHandler();
    reassembleHandler.reassemble({
      filePath: path.join(tmpFixtureDir, "Get_Info"),
      fileExtension: "flow-meta.xml",
    });
    const reassembledPath = path.join(tmpFixtureDir, "Get_Info.flow-meta.xml");
    if (!fs.existsSync(reassembledPath))
      throw new Error("Reassemble did not produce output file");
    const reassembledContent = fs.readFileSync(reassembledPath, "utf8");
    strictEqual(
      reassembledContent,
      originalContent,
      "Reassembled XML must match the original fixture exactly",
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  console.log("Smoke test passed:", process.platform, process.arch);
}

main().catch((err) => {
  console.error("Smoke test failed:", err.message);
  process.exit(1);
});
