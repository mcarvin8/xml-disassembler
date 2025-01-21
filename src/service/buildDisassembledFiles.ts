"use strict";

import { unlink } from "node:fs/promises";

import { logger } from "@src/index";
import { XmlElement } from "@src/helpers/types";
import { processElement } from "@src/service/processElement";
import { buildRootElementHeader } from "@src/service/buildRootElementHeader";
import { buildLeafFile } from "@src/service/buildLeafFile";
import { parseXML } from "@src/service/parseXML";
import { getConcurrencyThreshold } from "./getConcurrencyThreshold";
import { withConcurrencyLimit } from "./withConcurrencyLimit";

export async function buildDisassembledFiles(
  filePath: string,
  disassembledPath: string,
  uniqueIdElements: string | undefined,
  baseName: string,
  indent: string,
  postPurge: boolean,
): Promise<void> {
  const parsedXml = await parseXML(filePath);
  if (parsedXml === undefined) return;

  const rootElementName = Object.keys(parsedXml)[1];
  const rootElement: XmlElement = parsedXml[rootElementName];
  const rootElementHeader = buildRootElementHeader(
    rootElement,
    rootElementName,
  );

  let leafContent = "";
  let leafCount = 0;
  let hasNestedElements: boolean = false;

  const childKeys = Object.keys(rootElement).filter(
    (key: string) => !key.startsWith("@"),
  );

  const concurrencyLimit = getConcurrencyThreshold();

  // Create tasks for processing child keys
  const tasks: (() => Promise<void>)[] = childKeys.map((key) => {
    return async () => {
      if (Array.isArray(rootElement[key])) {
        await Promise.all(
          (rootElement[key] as XmlElement[]).map(async (element) => {
            const [
              updatedLeafContent,
              updatedLeafCount,
              updatedHasNestedElements,
            ] = await processElement({
              element,
              disassembledPath,
              uniqueIdElements,
              rootElementName,
              rootElementHeader,
              key,
              indent,
              leafContent: "",
              leafCount: 0,
              hasNestedElements: false,
            });
            leafContent += updatedLeafContent;
            leafCount += updatedLeafCount;
            hasNestedElements = hasNestedElements || updatedHasNestedElements;
          }),
        );
      } else {
        const [updatedLeafContent, updatedLeafCount, updatedHasNestedElements] =
          await processElement({
            element: rootElement[key] as XmlElement,
            disassembledPath,
            uniqueIdElements,
            rootElementName,
            rootElementHeader,
            key,
            indent,
            leafContent: "",
            leafCount: 0,
            hasNestedElements: false,
          });
        leafContent += updatedLeafContent;
        leafCount += updatedLeafCount;
        hasNestedElements = hasNestedElements || updatedHasNestedElements;
      }
    };
  });

  // Execute tasks with concurrency limit
  await withConcurrencyLimit(tasks, concurrencyLimit);

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
    );
  }
  if (postPurge) {
    await unlink(filePath);
  }
}
