"use strict";

import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path/posix";

import { logger } from "@src/index";
import { XmlElement } from "@src/types/types";
import { parseUniqueIdElement } from "@src/parsers/strategies/uid/parseUniqueIdElements";
import { buildXMLString } from "@src/builders/buildXMLString";
import { getTransformer } from "@src/transformers/getTransformer";

export async function buildNestedFile(
  element: XmlElement,
  disassembledPath: string,
  uniqueIdElements: string | undefined,
  rootElementName: string,
  rootAttributes: XmlElement,
  parentKey: string,
  xmlDeclarationStr: string,
  format: string,
): Promise<void> {
  const fieldName = parseUniqueIdElement(element, uniqueIdElements);

  const outputDirectory = join(disassembledPath, parentKey);
  const outputFileName = `${fieldName}.${parentKey}-meta.xml`;
  const outputPath = join(outputDirectory, outputFileName);

  await mkdir(outputDirectory, { recursive: true });

  // ✅ Wrap the nested element under parentKey with root attributes
  const finalXml: XmlElement = {
    [rootElementName]: {
      ...rootAttributes,
      [parentKey]: element,
    },
  };

  const serialized = `${xmlDeclarationStr}\n${buildXMLString(finalXml)}`;
  await writeFile(outputPath, serialized);

  logger.debug(`Created disassembled file: ${outputPath}`);

  const transformer = getTransformer(format);
  if (transformer) {
    await transformer(outputPath);
    await rm(outputPath);
  }
}
