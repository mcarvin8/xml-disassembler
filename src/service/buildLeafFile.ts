"use strict";

import { writeFile } from "node:fs/promises";
import { join } from "node:path/posix";

import { logger } from "@src/index";

export async function buildLeafFile(
  leafContent: string,
  disassembledPath: string,
  baseName: string,
  rootElementName: string,
  rootElementHeader: string,
  xmlDeclarationStr: string,
): Promise<void> {
  let leafFile = `${xmlDeclarationStr}\n`;
  leafFile += `${rootElementHeader}\n`;

  leafFile += leafContent;
  leafFile += `</${rootElementName}>`;
  const leafOutputPath = join(disassembledPath, `${baseName}.xml`);
  await writeFile(leafOutputPath, leafFile);

  logger.debug(`Created disassembled file: ${leafOutputPath}`);
}
