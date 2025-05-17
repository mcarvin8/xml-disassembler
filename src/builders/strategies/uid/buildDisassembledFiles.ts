"use strict";

import { unlink } from "node:fs/promises";

import { logger } from "@src/index";
import { XmlElement } from "@src/types/types";
import { parseElement } from "@src/parsers/strategies/uid/parseElement";
import { buildLeafFile } from "@src/builders/buildLeafFile";
import { parseXML } from "@src/parsers/parseXML";
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

  // Ensure XML declaration is attached directly to the XmlElement
  const rawDeclaration = parsedXml["?xml"];
  const xmlDeclaration: Record<string, string> | undefined =
    typeof rawDeclaration === "object" && rawDeclaration !== null
      ? (rawDeclaration as Record<string, string>)
      : undefined;

  const rootElementName = Object.keys(parsedXml).find((k) => k !== "?xml")!;
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
          format,
          xmlDeclaration,
        });

      const newContent = parsedLeafContent[key];
      if (Object.keys(result.leafContent).length > 0) {
        const newContent = result.leafContent[key];
        
        if (newContent !== undefined) {
          leafContent[key] = [...(leafContent[key] ?? []), ...(newContent as XmlElement[])];
        }
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
      format,
      xmlDeclaration,
    );
  }

  if (postPurge) {
    await unlink(filePath);
  }
}
