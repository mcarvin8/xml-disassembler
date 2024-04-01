"use strict";

import * as promises from "node:fs/promises";
import * as path from "node:path";
import { XMLParser } from "fast-xml-parser";

import { logger } from "@src/index";
import { XmlElement, XML_PARSER_OPTION } from "@src/helpers/types";
import { buildNestedFile } from "@src/service/buildNestedFiles";
import { buildRootElementHeader } from "@src/service/buildRootElementHeader";
import { buildLeafFile } from "@src/service/buildLeafFile";

export async function buildDisassembledFiles(
  xmlString: string,
  metadataPath: string,
  uniqueIdElements: string | undefined,
  baseName: string,
  indent: string,
  postPurge: boolean,
  parentPath: string,
): Promise<void> {
  const xmlParser = new XMLParser(XML_PARSER_OPTION);
  let result: Record<string, XmlElement>;
  try {
    result = xmlParser.parse(xmlString, true) as Record<string, XmlElement>;
  } catch (err) {
    logger.error(
      `${baseName}.xml was unable to be parsed. Confirm formatting and try again.`,
    );
    return;
  }
  const rootElementName = Object.keys(result)[1];

  const rootElement: XmlElement = result[rootElementName];
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
      // Iterate through the elements of the array
      for (const element of rootElement[key] as XmlElement[]) {
        if (typeof element === "object") {
          await buildNestedFile(
            element,
            metadataPath,
            uniqueIdElements,
            rootElementName,
            rootElementHeader,
            key,
            indent,
          );
          hasNestedElements = true;
        } else {
          const fieldValue = element;
          leafContent += `${indent}<${key}>${String(fieldValue)}</${key}>\n`;
          leafCount++;
        }
      }
    } else if (typeof rootElement[key] === "object") {
      await buildNestedFile(
        rootElement[key] as XmlElement,
        metadataPath,
        uniqueIdElements,
        rootElementName,
        rootElementHeader,
        key,
        indent,
      );
      hasNestedElements = true;
    } else {
      // Process XML elements that do not have children (e.g., leaf elements)
      const fieldValue = rootElement[key];
      // Append leaf element to the accumulated XML content
      leafContent += `${indent}<${key}>${String(fieldValue)}</${key}>\n`;
      leafCount++;
    }
  }

  if (!hasNestedElements) {
    logger.error(
      `The XML file ${baseName}.xml only has leaf elements. This file will not be disassembled.`,
    );
    return;
  }

  if (leafCount > 0) {
    await buildLeafFile(
      leafContent,
      metadataPath,
      baseName,
      rootElementName,
      rootElementHeader,
    );
  }
  if (postPurge) {
    const originalFilePath = path.resolve(`${parentPath}/${baseName}.xml`);
    promises.unlink(originalFilePath);
  }
}
