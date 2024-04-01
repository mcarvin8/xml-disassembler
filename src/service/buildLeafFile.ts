"use strict";

import * as promises from "node:fs/promises";
import * as path from "node:path";

import { logger } from "@src/index";
import { XML_HEADER } from "@src/helpers/constants";

export async function buildLeafFile(
  leafContent: string,
  metadataPath: string,
  baseName: string,
  rootElementName: string,
  rootElementHeader: string,
): Promise<void> {
  let leafFile = `${XML_HEADER}\n`;
  leafFile += rootElementHeader;

  const sortedLeafContent = leafContent
    .split("\n") // Split by lines
    .filter((line) => line.trim() !== "") // Remove empty lines
    .sort((a, b) => a.localeCompare(b)) // Sort alphabetically
    .join("\n"); // Join back into a string
  leafFile += sortedLeafContent;
  leafFile += `\n</${rootElementName}>`;
  const leafOutputPath = path.join(metadataPath, `${baseName}.xml`);
  await promises.writeFile(leafOutputPath, leafFile);

  logger.debug(`Created disassembled file: ${leafOutputPath}`);
}
