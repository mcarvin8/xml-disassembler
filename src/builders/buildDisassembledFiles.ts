"use strict";

import { unlink } from "node:fs/promises";
import { logger } from "@src/index";
import {
  XmlElement,
  XmlElementArrayMap,
  BuildDisassembledFilesOptions,
} from "@src/types/types";
import { buildDisassembledFile } from "@src/builders/buildDisassembledFile";
import { parseXML } from "@src/parsers/parseXML";
import { extractRootAttributes } from "@src/builders/extractRootAttributes";
import { parseElementUnified } from "@src/parsers/parseElement";

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

export async function buildDisassembledFilesUnified({
  filePath,
  disassembledPath,
  baseName,
  postPurge,
  format,
  uniqueIdElements,
  strategy,
}: BuildDisassembledFilesOptions): Promise<void> {
  const parsedXml = await parseXML(filePath);
  if (parsedXml === undefined) return;

  const rawDeclaration = parsedXml["?xml"];
  const xmlDeclaration =
    typeof rawDeclaration === "object" && rawDeclaration !== null
      ? (rawDeclaration as Record<string, string>)
      : undefined;

  const rootElementName = Object.keys(parsedXml).find((k) => k !== "?xml")!;
  const rootElement: XmlElement = parsedXml[rootElementName];
  const rootAttributes = extractRootAttributes(rootElement);

  let leafContent: XmlElementArrayMap = {};
  let leafCount = 0;
  let hasNestedElements = false;
  const nestedGroups: XmlElementArrayMap = {};
  const keyOrder = Object.keys(rootElement).filter((k) => !k.startsWith("@"));

  for (const key of keyOrder) {
    const elements = Array.isArray(rootElement[key])
      ? (rootElement[key] as XmlElement[])
      : [rootElement[key] as XmlElement];

    for (const element of elements) {
      const result = await parseElementUnified({
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
        strategy,
      });

      // Merge leaf content
      if (result.leafContent[key]) {
        leafContent[key] = [
          ...(leafContent[key] ?? []),
          ...(result.leafContent[key] as XmlElement[]),
        ];
      }

      // Merge nested groups (only for grouped strategy)
      if (strategy === "grouped-by-tag" && result.nestedGroups) {
        for (const tag in result.nestedGroups) {
          if (!nestedGroups[tag]) nestedGroups[tag] = [];
          nestedGroups[tag].push(...result.nestedGroups[tag]);
        }
      }

      leafCount = result.leafCount;
      hasNestedElements = result.hasNestedElements;
    }
  }

  if (!hasNestedElements && leafCount > 0) {
    logger.error(
      `The XML file ${filePath} only has leaf elements. This file will not be disassembled.`,
    );
    return;
  }

  if (strategy === "grouped-by-tag") {
    for (const tag in nestedGroups) {
      await buildDisassembledFile({
        content: nestedGroups[tag],
        disassembledPath,
        outputFileName: `${tag}.${format}`,
        wrapKey: tag,
        isGroupedArray: true,
        rootElementName,
        rootAttributes,
        xmlDeclaration,
        format,
      });
    }
  }

  if (leafCount > 0) {
    const orderedLeafContent =
      strategy === "grouped-by-tag"
        ? orderXmlElementKeys(leafContent, keyOrder)
        : leafContent;

    await buildDisassembledFile({
      content: orderedLeafContent,
      disassembledPath,
      outputFileName: `${baseName}.${format}`,
      rootElementName,
      rootAttributes,
      xmlDeclaration,
      format,
    });
  }

  if (postPurge) {
    await unlink(filePath);
  }
}
