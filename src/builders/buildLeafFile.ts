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
  xmlDeclaration: Record<string, string>,
  format: string,
): Promise<void> {
  const leafOutputPath = join(disassembledPath, `${baseName}.${format}`);
  await mkdir(disassembledPath, { recursive: true });

  const wrappedXml: XmlElement = {
    "?xml": xmlDeclaration,
    [rootElementName]: {
      ...rootAttributes,
      ...leafContent,
    },
  };

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
