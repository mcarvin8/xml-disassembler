"use strict";

import { unlink } from "node:fs/promises";
import { logger } from "@src/index";
import {
  XmlElement,
  XmlElementArrayMap,
  BuildDisassembledFilesOptions,
  LeafWriteParams,
} from "@src/types/types";
import { buildDisassembledFile } from "@src/builders/buildDisassembledFile";
import { parseXML } from "@src/parsers/parseXML";
import { extractRootAttributes } from "@src/builders/extractRootAttributes";
import { parseElementUnified } from "@src/parsers/parseElement";

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
  if (!parsedXml) return;

  const { rootElementName, rootElement, xmlDeclaration } =
    getRootInfo(parsedXml);
  const rootAttributes = extractRootAttributes(rootElement);
  const keyOrder = Object.keys(rootElement).filter((k) => !k.startsWith("@"));

  const { leafContent, nestedGroups, leafCount, hasNestedElements } =
    await disassembleElementKeys({
      rootElement,
      keyOrder,
      disassembledPath,
      rootElementName,
      rootAttributes,
      xmlDeclaration,
      uniqueIdElements,
      strategy,
      format,
    });

  if (shouldAbortForLeafOnly(leafCount, hasNestedElements, filePath)) return;

  await writeNestedGroups(nestedGroups, strategy, {
    disassembledPath,
    rootElementName,
    rootAttributes,
    xmlDeclaration,
    format,
  });

  await writeLeafContentIfAny({
    leafCount,
    leafContent,
    strategy,
    keyOrder,
    options: {
      disassembledPath,
      outputFileName: `${baseName}.${format}`,
      rootElementName,
      rootAttributes,
      xmlDeclaration,
      format,
    },
  });

  if (postPurge) {
    await unlink(filePath);
  }
}

function shouldAbortForLeafOnly(
  leafCount: number,
  hasNestedElements: boolean,
  filePath: string,
): boolean {
  if (!hasNestedElements && leafCount > 0) {
    logger.error(
      `The XML file ${filePath} only has leaf elements. This file will not be disassembled.`,
    );
    return true;
  }
  return false;
}

async function writeLeafContentIfAny({
  leafCount,
  leafContent,
  strategy,
  keyOrder,
  options,
}: LeafWriteParams): Promise<void> {
  if (leafCount === 0) return;

  const finalLeafContent =
    strategy === "grouped-by-tag"
      ? orderXmlElementKeys(leafContent, keyOrder)
      : leafContent;

  await buildDisassembledFile({
    content: finalLeafContent,
    ...options,
  });
}

function getRootInfo(parsedXml: XmlElement) {
  const rawDeclaration = parsedXml["?xml"];
  const xmlDeclaration =
    typeof rawDeclaration === "object" && rawDeclaration !== null
      ? (rawDeclaration as Record<string, string>)
      : undefined;

  // Assert the root element key exists and is valid
  const rootElementName = Object.keys(parsedXml).find(
    (k) => k !== "?xml",
  ) as string;

  // Assert the root is a valid XmlElement
  const rootElement = parsedXml[rootElementName] as XmlElement;

  return { rootElementName, rootElement, xmlDeclaration };
}

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

async function disassembleElementKeys({
  rootElement,
  keyOrder,
  disassembledPath,
  rootElementName,
  rootAttributes,
  xmlDeclaration,
  uniqueIdElements,
  strategy,
  format,
}: {
  rootElement: XmlElement;
  keyOrder: string[];
  disassembledPath: string;
  rootElementName: string;
  rootAttributes: Record<string, string>;
  xmlDeclaration?: Record<string, string>;
  uniqueIdElements?: string;
  strategy: string;
  format: string;
}) {
  let leafContent: XmlElementArrayMap = {};
  let nestedGroups: XmlElementArrayMap = {};
  let leafCount = 0;
  let hasNestedElements = false;

  // Process elements in parallel batches while maintaining order
  const BATCH_SIZE = 20;

  for (const key of keyOrder) {
    const elements = Array.isArray(rootElement[key])
      ? (rootElement[key] as XmlElement[])
      : [rootElement[key] as XmlElement];

    // Process elements in batches while preserving order
    for (let i = 0; i < elements.length; i += BATCH_SIZE) {
      const batch = elements.slice(i, i + BATCH_SIZE);
      // Use Promise.all to process in parallel but map maintains order
      const batchResults = await Promise.all(
        batch.map((element, index) =>
          parseElementUnified({
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
          }),
        ),
      );

      // Aggregate results from batch in the correct order
      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];

        if (result.leafContent[key]) {
          leafContent[key] = [
            ...(leafContent[key] ?? []),
            ...(result.leafContent[key] as XmlElement[]),
          ];
        }

        if (strategy === "grouped-by-tag" && result.nestedGroups) {
          for (const tag in result.nestedGroups) {
            nestedGroups[tag] = [
              ...(nestedGroups[tag] ?? []),
              ...result.nestedGroups[tag],
            ];
          }
        }

        leafCount = result.leafCount;
        hasNestedElements = result.hasNestedElements;
      }
    }
  }

  return { leafContent, nestedGroups, leafCount, hasNestedElements };
}

async function writeNestedGroups(
  nestedGroups: XmlElementArrayMap,
  strategy: string,
  options: {
    disassembledPath: string;
    rootElementName: string;
    rootAttributes: Record<string, string>;
    xmlDeclaration?: Record<string, string>;
    format: string;
  },
) {
  if (strategy !== "grouped-by-tag") return;

  for (const tag in nestedGroups) {
    await buildDisassembledFile({
      content: nestedGroups[tag],
      disassembledPath: options.disassembledPath,
      outputFileName: `${tag}.${options.format}`,
      wrapKey: tag,
      isGroupedArray: true,
      rootElementName: options.rootElementName,
      rootAttributes: options.rootAttributes,
      xmlDeclaration: options.xmlDeclaration,
      format: options.format,
    });
  }
}
