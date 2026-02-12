import path from "path";

// Platform-specific path so one npm package can ship win/linux/darwin binaries
const isDist = path.basename(__dirname) === "dist";
const nativeDir = isDist
  ? path.join(__dirname, "native", process.platform + "-" + process.arch)
  : path.join(
      __dirname,
      "..",
      "dist",
      "native",
      process.platform + "-" + process.arch,
    );
const nativeAddon = require(path.join(nativeDir, "index.node"));

export class DisassembleXMLFileHandler {
  disassemble(opts: {
    filePath: string;
    uniqueIdElements?: string;
    strategy?: string;
    prePurge?: boolean;
    postPurge?: boolean;
    ignorePath?: string;
    format?: string;
    multiLevel?: string;
    splitTags?: string;
  }): void {
    nativeAddon.disassemble(opts);
  }
}

export class ReassembleXMLFileHandler {
  reassemble(opts: {
    filePath: string;
    fileExtension?: string;
    postPurge?: boolean;
  }): void {
    nativeAddon.reassemble(opts);
  }
}
