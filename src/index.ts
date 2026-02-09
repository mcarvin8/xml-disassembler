/**
 * xml-disassembler - Node.js bindings to the Rust xml-disassembler crate.
 * Disassemble XML files into smaller, more manageable files and reassemble the XML when needed.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const native = require("xml-disassembler-crate");

export type XmlElement = {
  [key: string]: string | XmlElement | string[] | XmlElement[];
};

export class DisassembleXMLFileHandler {
  async disassemble(xmlAttributes: {
    filePath: string;
    uniqueIdElements?: string;
    strategy?: string;
    prePurge?: boolean;
    postPurge?: boolean;
    ignorePath?: string;
    format?: string;
  }): Promise<void> {
    native.disassemble(xmlAttributes);
  }
}

export class ReassembleXMLFileHandler {
  async reassemble(xmlAttributes: {
    filePath: string;
    fileExtension?: string;
    postPurge?: boolean;
  }): Promise<void> {
    native.reassemble(xmlAttributes);
  }
}

export async function parseXML(
  filePath: string,
): Promise<XmlElement | undefined> {
  const result = native.parseXml(filePath);
  return result ? (JSON.parse(result) as XmlElement) : undefined;
}

export function buildXMLString(element: XmlElement): string {
  return native.buildXmlString(JSON.stringify(element));
}

export async function transformToYaml(parsedXml: XmlElement): Promise<string> {
  return native.transformToYaml(JSON.stringify(parsedXml));
}

export async function transformToIni(parsedXml: XmlElement): Promise<string> {
  return native.transformToIni(JSON.stringify(parsedXml));
}

export async function transformToJson(parsedXml: XmlElement): Promise<string> {
  return native.transformToJson(JSON.stringify(parsedXml));
}

export async function transformToJson5(parsedXml: XmlElement): Promise<string> {
  return native.transformToJson5(JSON.stringify(parsedXml));
}

export async function transformToToml(parsedXml: XmlElement): Promise<string> {
  return native.transformToToml(JSON.stringify(parsedXml));
}
