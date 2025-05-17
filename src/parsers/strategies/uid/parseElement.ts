"use strict";

import { buildNestedFile } from "@src/builders/strategies/uid/buildNestedFiles";
import { XmlElement, XmlElementParams } from "@src/types/types";

export async function parseElement(
  params: XmlElementParams,
): Promise<[XmlElement, number, boolean]> {
  const {
    element,
    disassembledPath,
    uniqueIdElements,
    rootElementName,
    rootAttributes,
    key,
    leafCount,
    hasNestedElements,
    format,
    xmlDeclaration,
  } = params;

  // Nested element → write it to its own file
  if (typeof element === "object" && element !== null) {
    await buildNestedFile(
      element,
      disassembledPath,
      uniqueIdElements,
      rootElementName,
      rootAttributes,
      key,
      format,
      xmlDeclaration,
    );
    return [{}, leafCount, true];
  }

  // Leaf value → wrap in XmlElement
  const leafContent: XmlElement = {
    [key]: [element],
  };

  return [leafContent, leafCount + 1, hasNestedElements];
}
