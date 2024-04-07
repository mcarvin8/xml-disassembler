"use strict";

import * as promises from "node:fs/promises";
import * as path from "node:path";

import { logger } from "@src/index";
import { XML_HEADER } from "@src/helpers/constants";
import { XmlElement } from "@src/helpers/types";
import { findUniqueIdElement } from "@src/service/findUniqueIdElement";
import { buildXMLString } from "@src/service/buildXMLString";
import { buildRootElementHeader } from "./buildRootElementHeader";

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

  const outputDirectory = path.join(metadataPath, parentKey);
  const outputFileName: string = `${fieldName}.${parentKey}-meta.xml`;
  const outputPath = path.join(outputDirectory, outputFileName);

  // Create the output directory if it doesn't exist
  await promises.mkdir(outputDirectory, { recursive: true });
  const parentKeyHeader = await buildRootElementHeader(element, parentKey);

  // Call the buildXMLString to build the XML content string
  elementContent = buildXMLString(element, 2);
  let decomposeFileContents = `${XML_HEADER}\n`;
  decomposeFileContents += `${rootElementHeader}\n`;
  decomposeFileContents += `${indent}${parentKeyHeader}\n`;
  decomposeFileContents += `${elementContent}\n`;
  decomposeFileContents += `${indent}</${parentKey}>\n`;
  decomposeFileContents += `</${rootElementName}>`;

  // Write the XML content to the determined output path
  await promises.writeFile(outputPath, decomposeFileContents);
  logger.debug(`Created disassembled file: ${outputPath}`);
}
