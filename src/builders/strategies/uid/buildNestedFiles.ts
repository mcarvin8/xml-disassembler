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
  format: string,
  xmlDeclaration?: Record<string, string>,
): Promise<void> {
  const fieldName = parseUniqueIdElement(element, uniqueIdElements);

  const outputDirectory = join(disassembledPath, parentKey);
  const outputFileName = `${fieldName}.${parentKey}-meta.${format}`;
  const outputPath = join(outputDirectory, outputFileName);

  await mkdir(outputDirectory, { recursive: true });

  let finalXml: XmlElement = {
    [rootElementName]: {
      ...rootAttributes,
      [parentKey]: element,
    },
  };

  if (typeof xmlDeclaration === "object" && xmlDeclaration !== null) {
    finalXml = {
      "?xml": xmlDeclaration as Record<string, string>,
      ...finalXml,
    };
  }

  let nestedString: string;
  const transformer = getTransformer(format);
  if (transformer) {
    nestedString = await transformer(finalXml);
  } else {
    nestedString = buildXMLString(finalXml);
  }
  await writeFile(outputPath, nestedString);
  logger.debug(`Created disassembled file: ${outputPath}`);
}
