"use strict";

import { unlink } from "node:fs/promises";

import { logger } from "@src/index";
import { XmlElement } from "@src/types/types";
import { parseElement } from "@src/parsers/parseElement";
import { buildRootElementHeader } from "@src/builders/buildRootElementHeader";
import { buildLeafFile } from "@src/builders/buildLeafFile";
import { buildGroupedNestedFile } from "@src/builders/buildGroupNestedFile";
import { parseXML } from "@src/parsers/parseXML";
import { buildXMLDeclaration } from "@src/builders/buildXmlDeclaration";

export async function buildDisassembledFiles(
  filePath: string,
  disassembledPath: string,
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
  let hasNestedElements = false;
  const nestedGroups: Record<string, XmlElement[]> = {};

  for (const key of Object.keys(rootElement).filter(
    (key: string) => !key.startsWith("@"),
  )) {
    const elements = Array.isArray(rootElement[key])
      ? (rootElement[key] as XmlElement[])
      : [rootElement[key] as XmlElement];

    for (const element of elements) {
      const result = await parseElement({
        element,
        disassembledPath,
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

      leafContent = result.leafContent;
      leafCount = result.leafCount;
      hasNestedElements = result.hasNestedElements;

      for (const tag in result.nestedGroups) {
        if (!nestedGroups[tag]) nestedGroups[tag] = [];
        nestedGroups[tag].push(...result.nestedGroups[tag]);
      }
    }
  }

  if (!hasNestedElements) {
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
      rootElementHeader,
      xmlDeclarationStr,
      indent,
      format,
    );
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
    await unlink(filePath);
  }
}
