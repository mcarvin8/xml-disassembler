"use strict";

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path/posix";

import { logger } from "@src/index";
import { XmlElement, BuildDisassembledFileOptions } from "@src/types/types";
import { buildXMLString } from "@src/builders/buildXMLString";
import { getTransformer } from "@src/transformers/getTransformer";
import { parseUniqueIdElement } from "@src/parsers/parseUniqueIdElements";

export async function buildDisassembledFile({
  content,
  disassembledPath,
  outputFileName,
  subdirectory,
  wrapKey,
  isGroupedArray = false,
  rootElementName,
  rootAttributes,
  xmlDeclaration,
  format,
  uniqueIdElements,
}: BuildDisassembledFileOptions): Promise<void> {
  // Determine directory
  const targetDirectory = subdirectory
    ? join(disassembledPath, subdirectory)
    : disassembledPath;

  // Determine filename
  let fileName = outputFileName;
  if (!fileName && wrapKey && !isGroupedArray && typeof content === "object") {
    const fieldName = parseUniqueIdElement(
      content as XmlElement,
      uniqueIdElements,
    );
    fileName = `${fieldName}.${wrapKey}-meta.${format}`;
  }
  const outputPath = join(targetDirectory, fileName!);

  await mkdir(targetDirectory, { recursive: true });

  let wrappedXml: XmlElement = {
    [rootElementName]: {
      ...rootAttributes,
      ...(wrapKey
        ? { [wrapKey]: isGroupedArray ? content : content }
        : (content as XmlElement)),
    },
  };

  if (typeof xmlDeclaration === "object" && xmlDeclaration !== null) {
    wrappedXml = {
      "?xml": xmlDeclaration as Record<string, string>,
      ...wrappedXml,
    };
  }

  const transformer = getTransformer(format);
  const outputString = transformer
    ? await transformer(wrappedXml)
    : buildXMLString(wrappedXml);

  await writeFile(outputPath, outputString);
  logger.debug(`Created disassembled file: ${outputPath}`);
}
