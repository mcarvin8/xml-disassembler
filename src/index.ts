import path from "path";
import { resolveNativeDir } from "./native-dir";

const nativeDir = resolveNativeDir(
  __dirname,
  process.platform,
  process.arch,
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
