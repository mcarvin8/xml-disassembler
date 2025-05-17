"use strict";

import { unlink } from "node:fs/promises";
import { logger } from "@src/index";
import { XmlElement } from "@src/types/types";
import { parseElement } from "@src/parsers/strategies/grouped-by-tag/parseElement";
import { buildLeafFile } from "@src/builders/buildLeafFile";
import { buildGroupedNestedFile } from "@src/builders/strategies/grouped-by-tag/buildGroupNestedFile";
import { parseXML } from "@src/parsers/parseXML";
import { extractRootAttributes } from "@src/builders/extractRootAttributes";

function orderXmlElementKeys(
  content: XmlElement,
  keyOrder: string[],
): XmlElement {
  const ordered: XmlElement = {};
  for (const key of keyOrder) {
    if (content[key] !== undefined) {
      ordered[key] = content[key];
    }
  }
  return ordered;
}

export async function buildDisassembledFiles(
  filePath: string,
  disassembledPath: string,
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

  let leafContent: Record<string, XmlElement[]> = {};
  let leafCount = 0;
  let hasNestedElements = false;
  const nestedGroups: Record<string, XmlElement[]> = {};
  const keyOrder = Object.keys(rootElement).filter((k) => !k.startsWith("@"));

  for (const key of keyOrder) {
    const elements = Array.isArray(rootElement[key])
      ? (rootElement[key] as XmlElement[])
      : [rootElement[key] as XmlElement];

    for (const element of elements) {
      const result = await parseElement({
        element,
        disassembledPath,
        rootElementName,
        rootAttributes,
        key,
        leafContent,
        leafCount,
        hasNestedElements,
        xmlDeclaration,
        format,
      });

      if (Object.keys(result.leafContent).length > 0) {
        const newContent = result.leafContent[key];
        
        if (newContent !== undefined) {
          leafContent[key] = [...(leafContent[key] ?? []), ...newContent];
        }
      }

      leafCount = result.leafCount;
      hasNestedElements = result.hasNestedElements;

      for (const tag in result.nestedGroups) {
        if (!nestedGroups[tag]) nestedGroups[tag] = [];
        nestedGroups[tag].push(...result.nestedGroups[tag]);
      }
    }
  }

  if (!hasNestedElements && leafCount > 0) {
    logger.error(
      `The XML file ${filePath} only has leaf elements. This file will not be disassembled.`,
    );
    return;
  }

  for (const tag in nestedGroups) {
    await buildGroupedNestedFile(
      tag,
      nestedGroups[tag],
      disassembledPath,
      rootElementName,
      rootAttributes,
      format,
      xmlDeclaration,
    );
  }

  if (leafCount > 0) {
    const orderedLeafContent = orderXmlElementKeys(leafContent, keyOrder);
    await buildLeafFile(
      orderedLeafContent,
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
