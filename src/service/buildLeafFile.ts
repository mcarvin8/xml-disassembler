"use strict";

import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import { logger } from "@src/index";
import { XML_HEADER } from "@src/helpers/constants";

export async function buildLeafFile(
  leafContent: string,
  disassembledPath: string,
  baseName: string,
  rootElementName: string,
  rootElementHeader: string,
): Promise<void> {
  let leafFile = `${XML_HEADER}\n`;
  leafFile += `${rootElementHeader}\n`;

  leafFile += leafContent;
  leafFile += `</${rootElementName}>`;
  const leafOutputPath = join(disassembledPath, `${baseName}.xml`);
  await writeFile(leafOutputPath, leafFile);

  logger.debug(`Created disassembled file: ${leafOutputPath}`);
}
