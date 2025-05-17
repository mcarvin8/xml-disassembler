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
  format: string,
  xmlDeclaration?: Record<string, string>,
): Promise<void> {
  const outputPath = join(disassembledPath, `${tag}.${format}`);
  await mkdir(disassembledPath, { recursive: true });

  // Each element is already a valid XmlElement structure
  let rootElement: XmlElement = {
    [rootElementName]: {
      ...rootAttributes,
      [tag]: elements,
    },
  };

  if (typeof xmlDeclaration === "object" && xmlDeclaration !== null) {
    rootElement = {
      "?xml": xmlDeclaration as Record<string, string>,
      ...rootElement,
    };
  }

  let nestedString: string;
  const transformer = getTransformer(format);
  if (transformer) {
    nestedString = await transformer(rootElement);
  } else {
    nestedString = buildXMLString(rootElement);
  }
  await writeFile(outputPath, nestedString);
  logger.debug(`Created disassembled file: ${outputPath}`);
}
