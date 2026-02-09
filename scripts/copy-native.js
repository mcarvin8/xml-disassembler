const fs = require("fs");
const path = require("path");

const nativeDir = path.join("dist", "native");
fs.mkdirSync(nativeDir, { recursive: true });
fs.copyFileSync(
  path.join("xml-disassembler-crate", "index.node"),
  path.join(nativeDir, "index.node"),
);
fs.copyFileSync(
  path.join("scripts", "native-loader.cjs"),
  path.join("dist", "native-loader.cjs"),
);
