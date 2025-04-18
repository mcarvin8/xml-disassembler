"use strict";

import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path/posix";

import { logger } from "@src/index";
import { XmlElement } from "@src/types/types";
import { buildXMLString } from "@src/builders/buildXMLString";
import { getTransformer } from "@src/transformers/getTransformer";

export async function buildGroupedNestedFile(
  tag: string,
  elements: XmlElement[],
  disassembledPath: string,
  rootElementName: string,
  rootElementHeader: string,
  xmlDeclarationStr: string,
  indent: string,
  format: string,
): Promise<void> {
  const outputPath = join(disassembledPath, `${tag}.xml`);
  // Create the output directory if it doesn't exist
  await mkdir(disassembledPath, { recursive: true });

  let content = `${xmlDeclarationStr}\n${rootElementHeader}\n`;
  for (const el of elements) {
    content += `${indent}<${tag}>\n`;
    content += buildXMLString(el, 2); // uses indent level 2
    content += `\n${indent}</${tag}>\n`;
  }
  content += `</${rootElementName}>`;

  await writeFile(outputPath, content);
  logger.debug(`Created grouped nested file: ${outputPath}`);

  const transformer = getTransformer(format);
  if (transformer) {
    await transformer(outputPath);
    await rm(outputPath);
  }
}
