"use strict";

import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path/posix";

import { logger } from "@src/index";
import { XmlElement } from "@src/types/types";
import { buildXMLString } from "@src/builders/buildXMLString";
import { getTransformer } from "@src/transformers/getTransformer";

export async function buildLeafFile(
  leafContent: XmlElement,
  disassembledPath: string,
  baseName: string,
  rootElementName: string,
  rootAttributes: XmlElement,
  format: string,
  xmlDeclaration?: Record<string, string>,
): Promise<void> {
  const leafOutputPath = join(disassembledPath, `${baseName}.${format}`);
  await mkdir(disassembledPath, { recursive: true });

  let wrappedXml: XmlElement = {
    [rootElementName]: {
      ...rootAttributes,
      ...leafContent,
    },
  };

  if (typeof xmlDeclaration === "object" && xmlDeclaration !== null) {
    wrappedXml = {
      "?xml": xmlDeclaration as Record<string, string>,
      ...wrappedXml,
    };
  }

  let leafString: string;
  const transformer = getTransformer(format);
  if (transformer) {
    leafString = await transformer(wrappedXml);
  } else {
    leafString = buildXMLString(wrappedXml);
  }
  await writeFile(leafOutputPath, leafString);
  logger.debug(`Created disassembled file: ${leafOutputPath}`);
}
