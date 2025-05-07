"use strict";

import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path/posix";

import { logger, parseXML } from "@src/index";
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
  await mkdir(disassembledPath, { recursive: true });

  let content = `${xmlDeclarationStr}\n${rootElementHeader}\n`;

  for (const el of elements) {
    const attributes = Object.entries(el)
      .filter(([key, value]) => isPrefixedAttribute(key, value)) // ✅ this line will now be covered
      .map(([key, value]) => ` ${key.replace(/^@_/, "")}="${value}"`)
      .join("");

    const elementWithoutAttrs: XmlElement = Object.fromEntries(
      Object.entries(el).filter(([key]) => !key.startsWith("@_")),
    );

    content += `${indent}<${tag}${attributes}>\n`;
    content += buildXMLString(elementWithoutAttrs);
    content += `\n${indent}</${tag}>\n`;
  }

  content += `</${rootElementName}>`;

  await writeFile(outputPath, content);
  // reparse and rebuild XML for proper formatting
  const parsedXml = await parseXML(outputPath);
  const reparsedXml = buildXMLString(parsedXml as XmlElement);
  await writeFile(outputPath, reparsedXml);
  logger.debug(`Created grouped nested file: ${outputPath}`);

  const transformer = getTransformer(format);
  if (transformer) {
    await transformer(outputPath);
    await rm(outputPath);
  }
}

function isPrefixedAttribute(key: string, value: unknown): boolean {
  const isAttr = key.startsWith("@_");
  const isLiteral = typeof value === "string" || typeof value === "number";
  return isAttr && isLiteral;
}
