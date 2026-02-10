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
  console.log("[smoke] Platform:", process.platform, process.arch);
  console.log("[smoke] Node:", process.version);

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
  console.log(
    "[smoke] Fixture:",
    fixtureFile,
    "(" + originalContent.length + " chars)",
  );

  const tmpDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "xml-disassembler-smoke-"),
  );
  const tmpFixtureDir = path.join(tmpDir, "deeply-nested-unique-id-element");
  fs.mkdirSync(tmpFixtureDir, { recursive: true });
  fs.copyFileSync(
    fixtureFile,
    path.join(tmpFixtureDir, "Get_Info.flow-meta.xml"),
  );
  console.log("[smoke] Temp dir:", tmpDir);

  try {
    // Parse + build round-trip (validates native addon and core API)
    const xmlPath = path.join(tmpFixtureDir, "Get_Info.flow-meta.xml");
    console.log("[smoke] Parse + build round-trip...");
    const parsed = await parseXML(xmlPath);
    if (!parsed) throw new Error("parseXML returned undefined");
    const rebuilt = buildXMLString(parsed);
    if (!rebuilt || !rebuilt.includes("Flow"))
      throw new Error("buildXMLString failed");
    console.log("[smoke] Parse + build OK");

    // Disassemble + reassemble using deeply-nested fixture and unique ID elements
    console.log("[smoke] Disassemble (unique-id, xml)...");
    const handler = new DisassembleXMLFileHandler();
    handler.disassemble({
      filePath: tmpFixtureDir,
      uniqueIdElements: UNIQUE_ID_ELEMENTS,
      strategy: "unique-id",
      format: "xml",
    });
    const disassembledFiles = fs.readdirSync(tmpFixtureDir, {
      recursive: true,
    });
    console.log(
      "[smoke] Disassemble OK, output files:",
      disassembledFiles.length,
    );

    console.log("[smoke] Reassemble...");
    const reassembleHandler = new ReassembleXMLFileHandler();
    reassembleHandler.reassemble({
      filePath: path.join(tmpFixtureDir, "Get_Info"),
      fileExtension: "flow-meta.xml",
    });
    const reassembledPath = path.join(tmpFixtureDir, "Get_Info.flow-meta.xml");
    if (!fs.existsSync(reassembledPath))
      throw new Error("Reassemble did not produce output file");
    const reassembledContent = fs.readFileSync(reassembledPath, "utf8");
    console.log(
      "[smoke] Reassemble OK, output length:",
      reassembledContent.length,
    );

    console.log("[smoke] Comparing reassembled output to fixture...");
    strictEqual(
      reassembledContent,
      originalContent,
      "Reassembled XML must match the original fixture exactly",
    );
    console.log("[smoke] Comparison OK (exact match)");
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  console.log("[smoke] Smoke test passed:", process.platform, process.arch);
}

main().catch((err) => {
  console.error("Smoke test failed:", err.message);
  process.exit(1);
});
