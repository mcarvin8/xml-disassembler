const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const platform = process.platform + "-" + process.arch;
const outDir = path.join("dist", "native", platform);
fs.mkdirSync(outDir, { recursive: true });

const outFile = path.join(outDir, "index.node");
execSync(
  `npx cargo-cp-artifact -a cdylib xml-disassembler-crate "${outFile}" -- cargo build --release --message-format=json-render-diagnostics`,
  { stdio: "inherit" },
);
