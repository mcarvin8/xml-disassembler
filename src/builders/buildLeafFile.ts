"use strict";

import { writeFile, rm } from "node:fs/promises";
import { join } from "node:path/posix";

import { logger } from "@src/index";
import { getTransformer } from "@src/transformers/getTransformer";

export async function buildLeafFile(
  leafContent: string,
  disassembledPath: string,
  baseName: string,
  rootElementName: string,
  rootElementHeader: string,
  xmlDeclarationStr: string,
  format: string,
): Promise<void> {
  let leafFile = `${xmlDeclarationStr}\n`;
  leafFile += `${rootElementHeader}\n`;

  leafFile += leafContent;
  leafFile += `</${rootElementName}>`;
  const leafOutputPath = join(disassembledPath, `${baseName}.xml`);
  await writeFile(leafOutputPath, leafFile);

  logger.debug(`Created disassembled file: ${leafOutputPath}`);

  const transformer = getTransformer(format);
  if (transformer) {
    await transformer(leafOutputPath);
    // delete the XML file after transforming it
    await rm(leafOutputPath);
  }
}
