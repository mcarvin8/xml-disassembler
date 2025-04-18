"use strict";

import { unlink } from "node:fs/promises";

import { logger } from "@src/index";
import { XmlElement } from "@src/types/types";
import { parseElement } from "@src/parsers/strategies/uid/parseElement";
import { buildRootElementHeader } from "@src/builders/buildRootElementHeader";
import { buildLeafFile } from "@src/builders/buildLeafFile";
import { parseXML } from "@src/parsers/parseXML";
import { buildXMLDeclaration } from "@src/builders/buildXmlDeclaration";

export async function buildDisassembledFiles(
  filePath: string,
  disassembledPath: string,
  uniqueIdElements: string | undefined,
  baseName: string,
  indent: string,
  postPurge: boolean,
  format: string,
): Promise<void> {
  const parsedXml = await parseXML(filePath);
  if (parsedXml === undefined) return;
  const rootElementName = Object.keys(parsedXml)[1];
  const xmlDeclarationStr = buildXMLDeclaration(parsedXml);
  const rootElement: XmlElement = parsedXml[rootElementName];
  const rootElementHeader = buildRootElementHeader(
    rootElement,
    rootElementName,
  );
  let leafContent = "";
  let leafCount = 0;
  let hasNestedElements: boolean = false;

  // Iterate through child elements to find the field name for each
  for (const key of Object.keys(rootElement).filter(
    (key: string) => !key.startsWith("@"),
  )) {
    if (Array.isArray(rootElement[key])) {
      for (const element of rootElement[key] as XmlElement[]) {
        const [updatedLeafContent, updatedLeafCount, updatedHasNestedElements] =
          await parseElement({
            element,
            disassembledPath,
            uniqueIdElements,
            rootElementName,
            rootElementHeader,
            key,
            indent,
            leafContent,
            leafCount,
            hasNestedElements,
            xmlDeclarationStr,
            format,
          });
        leafContent = updatedLeafContent;
        leafCount = updatedLeafCount;
        hasNestedElements = updatedHasNestedElements;
      }
    } else {
      const [updatedLeafContent, updatedLeafCount, updatedHasNestedElements] =
        await parseElement({
          element: rootElement[key] as XmlElement,
          disassembledPath,
          uniqueIdElements,
          rootElementName,
          rootElementHeader,
          key,
          indent,
          leafContent,
          leafCount,
          hasNestedElements,
          xmlDeclarationStr,
          format,
        });
      leafContent = updatedLeafContent;
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
      rootElementHeader,
      xmlDeclarationStr,
      format,
    );
  }
  if (postPurge) {
    unlink(filePath);
  }
}
