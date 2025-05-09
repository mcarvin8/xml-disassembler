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
  rootAttributes: XmlElement,
  xmlDeclarationStr: string,
  format: string,
): Promise<void> {
  const outputPath = join(disassembledPath, `${tag}.xml`);
  await mkdir(disassembledPath, { recursive: true });

  // Each element is already a valid XmlElement structure
  const rootElement: XmlElement = {
    [rootElementName]: {
      ...rootAttributes,
      [tag]: elements,
    },
  };

  const serialized = `${xmlDeclarationStr}\n${buildXMLString(rootElement)}`;
  await writeFile(outputPath, serialized);
  logger.debug(`Created grouped nested file: ${outputPath}`);

  const transformer = getTransformer(format);
  if (transformer) {
    await transformer(outputPath);
    await rm(outputPath);
  }
}
