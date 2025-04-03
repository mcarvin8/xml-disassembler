"use strict";

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path/posix";

import { logger } from "@src/index";
import { XmlElement } from "@src/types/types";
import { parseUniqueIdElement } from "@src/parsers/parseUniqueIdElements";
import { buildXMLString } from "@src/builders/buildXMLString";
import { buildRootElementHeader } from "@src/builders/buildRootElementHeader";

export async function buildNestedFile(
  element: XmlElement,
  disassembledPath: string,
  uniqueIdElements: string | undefined,
  rootElementName: string,
  rootElementHeader: string,
  parentKey: string,
  indent: string,
  xmlDeclarationStr: string,
): Promise<void> {
  let elementContent = "";

  const fieldName = parseUniqueIdElement(element, uniqueIdElements);

  const outputDirectory = join(disassembledPath, parentKey);
  const outputFileName: string = `${fieldName}.${parentKey}-meta.xml`;
  const outputPath = join(outputDirectory, outputFileName);

  // Create the output directory if it doesn't exist
  await mkdir(outputDirectory, { recursive: true });
  const parentKeyHeader = buildRootElementHeader(element, parentKey);

  // Call the buildXMLString to build the XML content string
  elementContent = buildXMLString(element, 2);
  let nestedFileContents = `${xmlDeclarationStr}\n`;
  nestedFileContents += `${rootElementHeader}\n`;
  nestedFileContents += `${indent}${parentKeyHeader}\n`;
  nestedFileContents += `${elementContent}\n`;
  nestedFileContents += `${indent}</${parentKey}>\n`;
  nestedFileContents += `</${rootElementName}>`;

  // Write the XML content to the determined output path
  await writeFile(outputPath, nestedFileContents);
  logger.debug(`Created disassembled file: ${outputPath}`);
}
