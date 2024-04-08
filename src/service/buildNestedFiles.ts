"use strict";

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { logger } from "@src/index";
import { XML_HEADER } from "@src/helpers/constants";
import { XmlElement } from "@src/helpers/types";
import { findUniqueIdElement } from "@src/service/findUniqueIdElement";
import { buildXMLString } from "@src/service/buildXMLString";
import { buildRootElementHeader } from "@src/service/buildRootElementHeader";

export async function buildNestedFile(
  element: XmlElement,
  metadataPath: string,
  uniqueIdElements: string | undefined,
  rootElementName: string,
  rootElementHeader: string,
  parentKey: string,
  indent: string,
): Promise<void> {
  let elementContent = "";

  const fieldName = findUniqueIdElement(element, uniqueIdElements);

  const outputDirectory = join(metadataPath, parentKey);
  const outputFileName: string = `${fieldName}.${parentKey}-meta.xml`;
  const outputPath = join(outputDirectory, outputFileName);

  // Create the output directory if it doesn't exist
  await mkdir(outputDirectory, { recursive: true });
  const parentKeyHeader = buildRootElementHeader(element, parentKey);

  // Call the buildXMLString to build the XML content string
  elementContent = buildXMLString(element, 2);
  let nestedFileContents = `${XML_HEADER}\n`;
  nestedFileContents += `${rootElementHeader}\n`;
  nestedFileContents += `${indent}${parentKeyHeader}\n`;
  nestedFileContents += `${elementContent}\n`;
  nestedFileContents += `${indent}</${parentKey}>\n`;
  nestedFileContents += `</${rootElementName}>`;

  // Write the XML content to the determined output path
  await writeFile(outputPath, nestedFileContents);
  logger.debug(`Created disassembled file: ${outputPath}`);
}
