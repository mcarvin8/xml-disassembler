"use strict";

import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path/posix";

import { logger, parseXML } from "@src/index";
import { XmlElement } from "@src/types/types";
import { parseUniqueIdElement } from "@src/parsers/strategies/uid/parseUniqueIdElements";
import { buildXMLString } from "@src/builders/buildXMLString";
import { buildRootElementHeader } from "@src/builders/buildRootElementHeader";
import { getTransformer } from "@src/transformers/getTransformer";

export async function buildNestedFile(
  element: XmlElement,
  disassembledPath: string,
  uniqueIdElements: string | undefined,
  rootElementName: string,
  rootElementHeader: string,
  parentKey: string,
  indent: string,
  xmlDeclarationStr: string,
  format: string,
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
  elementContent = buildXMLString(element);
  let nestedFileContents = `${xmlDeclarationStr}\n`;
  nestedFileContents += `${rootElementHeader}\n`;
  nestedFileContents += `${indent}${parentKeyHeader}\n`;
  nestedFileContents += `${elementContent}\n`;
  nestedFileContents += `${indent}</${parentKey}>\n`;
  nestedFileContents += `</${rootElementName}>`;

  // Write the XML content to the determined output path
  await writeFile(outputPath, nestedFileContents);
  // reparse and rebuild XML for proper formatting
  const parsedXml = await parseXML(outputPath);
  const reparsedXml = buildXMLString(parsedXml as XmlElement);
  await writeFile(outputPath, reparsedXml);

  logger.debug(`Created disassembled file: ${outputPath}`);

  const transformer = getTransformer(format);
  if (transformer) {
    await transformer(outputPath);
    // delete the XML file after transforming it
    await rm(outputPath);
  }
}
