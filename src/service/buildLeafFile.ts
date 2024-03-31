"use strict";

import * as fs from "node:fs";
import * as path from "node:path";

import { logger } from "@src/index";
import { XML_HEADER } from "@src/helpers/constants";

export function buildLeafFile(
  leafContent: string,
  metadataPath: string,
  baseName: string,
  rootElementName: string,
  rootElementHeader: string,
): void {
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
  fs.writeFileSync(leafOutputPath, leafFile);

  logger.debug(`Created disassembled file: ${leafOutputPath}`);
}
