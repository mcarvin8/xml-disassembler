"use strict";

import { buildNestedFile } from "@src/builders/buildNestedFiles";
import { XmlElementParams } from "@src/types/types";

export async function parseElement(
  params: XmlElementParams,
): Promise<[string, number, boolean]> {
  const {
    element,
    disassembledPath,
    uniqueIdElements,
    rootElementName,
    rootElementHeader,
    key,
    indent,
    leafContent,
    leafCount,
    hasNestedElements,
    xmlDeclarationStr,
    format,
  } = params;

  if (typeof element === "object") {
    await buildNestedFile(
      element,
      disassembledPath,
      uniqueIdElements,
      rootElementName,
      rootElementHeader,
      key,
      indent,
      xmlDeclarationStr,
      format,
    );
    return [leafContent, leafCount, true];
  } else {
    const updatedLeafContent = `${leafContent}${indent}<${key}>${String(element)}</${key}>\n`;
    return [updatedLeafContent, leafCount + 1, hasNestedElements];
  }
}
