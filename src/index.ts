import path from "path";

// Resolves to dist/native/index.node from both src/ (tests) and dist/ (published)
const nativeAddon = require(
  path.join(__dirname, "..", "dist", "native", "index.node"),
);

export interface XmlElement {
  name: string;
  attributes?: Record<string, string>;
  children?: XmlNode[];
  [key: string]: unknown;
}

export type XmlNode = XmlElement | string;

export async function parseXML(
  filePath: string,
): Promise<XmlElement | undefined> {
  const json = nativeAddon.parseXml(filePath);
  return json != null ? JSON.parse(json) : undefined;
}

export function buildXMLString(element: XmlElement): string {
  return nativeAddon.buildXmlString(JSON.stringify(element));
}

export function transformToYaml(element: XmlElement): string {
  return nativeAddon.transformToYaml(JSON.stringify(element));
}

export function transformToJson(element: XmlElement): string {
  return nativeAddon.transformToJson(JSON.stringify(element));
}

export function transformToJson5(element: XmlElement): string {
  return nativeAddon.transformToJson5(JSON.stringify(element));
}

export class DisassembleXMLFileHandler {
  disassemble(opts: {
    filePath: string;
    uniqueIdElements?: string;
    strategy?: string;
    prePurge?: boolean;
    postPurge?: boolean;
    ignorePath?: string;
    format?: string;
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
