"use strict";

import { unlink } from "node:fs/promises";

import { logger } from "@src/index";
import { XmlElement } from "@src/types/types";
import { parseElement } from "@src/parsers/strategies/uid/parseElement";
import { buildLeafFile } from "@src/builders/buildLeafFile";
import { parseXML } from "@src/parsers/parseXML";
import { buildXMLDeclaration } from "@src/builders/buildXmlDeclaration";
import { extractRootAttributes } from "@src/builders/extractRootAttributes";

export async function buildDisassembledFiles(
  filePath: string,
  disassembledPath: string,
  uniqueIdElements: string | undefined,
  baseName: string,
  postPurge: boolean,
  format: string,
): Promise<void> {
  const parsedXml = await parseXML(filePath);
  if (parsedXml === undefined) return;

  const rootElementName = Object.keys(parsedXml)[1];
  const xmlDeclarationStr = buildXMLDeclaration(parsedXml);
  const rootElement: XmlElement = parsedXml[rootElementName];
  const rootAttributes = extractRootAttributes(rootElement);

  let leafContent: XmlElement = {};
  let leafCount = 0;
  let hasNestedElements = false;

  for (const key of Object.keys(rootElement).filter(
    (k) => !k.startsWith("@"),
  )) {
    const elements = Array.isArray(rootElement[key])
      ? (rootElement[key] as XmlElement[])
      : [rootElement[key] as XmlElement];

    for (const element of elements) {
      const [parsedLeafContent, updatedLeafCount, updatedHasNestedElements] =
        await parseElement({
          element,
          disassembledPath,
          uniqueIdElements,
          rootElementName,
          rootAttributes,
          key,
          leafContent,
          leafCount,
          hasNestedElements,
          xmlDeclarationStr,
          format,
        });

      const newContent = parsedLeafContent[key];
      if (newContent !== undefined) {
        const existing = leafContent[key];

        const existingArray = Array.isArray(existing)
          ? (existing as XmlElement[])
          : existing !== undefined
            ? [existing as XmlElement]
            : [];

        const incomingArray = Array.isArray(newContent)
          ? (newContent as XmlElement[])
          : [newContent as XmlElement];

        leafContent[key] = [...existingArray, ...incomingArray];
      }

      leafCount = updatedLeafCount;
      hasNestedElements = updatedHasNestedElements;
    }
  }

  if (!hasNestedElements) {
    logger.error(
      `The XML file ${filePath} only has leaf elements. This file will not be disassembled.`,
    );
    return;
  }

  if (leafCount > 0) {
    await buildLeafFile(
      leafContent,
      disassembledPath,
      baseName,
      rootElementName,
      rootAttributes,
      xmlDeclarationStr,
      format,
    );
  }

  if (postPurge) {
    await unlink(filePath);
  }
}
