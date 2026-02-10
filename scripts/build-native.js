const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// In CI we set TARGET (Rust triple) and NODE_PLATFORM_ID (e.g. darwin-x64) per matrix job.
// Locally we use process.platform + "-" + process.arch.
const nodePlatformId =
  process.env.NODE_PLATFORM_ID || process.platform + "-" + process.arch;
const rustTarget = process.env.TARGET;

const outDir = path.join("dist", "native", nodePlatformId);
fs.mkdirSync(outDir, { recursive: true });

const outFile = path.join(outDir, "index.node");
const targetArg = rustTarget ? ` --target ${rustTarget}` : "";
execSync(
  `npx cargo-cp-artifact -a cdylib xml-disassembler-crate "${outFile}" -- cargo build --release --message-format=json-render-diagnostics${targetArg}`,
  { stdio: "inherit" },
);
