"use strict";

import { buildDisassembledFile } from "@src/builders/buildDisassembledFile";
import { XmlElementParams, UnifiedParseResult } from "@src/types/types";

export async function parseElementUnified(
  params: XmlElementParams & {
    strategy: string;
  },
): Promise<UnifiedParseResult> {
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
    strategy,
  } = params;

  const isArray = Array.isArray(element);
  const isNestedObject =
    typeof element === "object" &&
    element !== null &&
    Object.keys(element).some((k) => !k.startsWith("#")); // heuristic: non-text/attrs
  const isNested = isArray || isNestedObject;

  if (isNested) {
    if (strategy === "grouped-by-tag") {
      // Group all nested under key
      return {
        leafContent: {},
        leafCount,
        hasNestedElements: true,
        nestedGroups: { [key]: [element] },
      };
    } else {
      // strategy === 'uid': write immediately
      await buildDisassembledFile({
        content: element,
        disassembledPath,
        subdirectory: key,
        wrapKey: key,
        rootElementName,
        rootAttributes,
        xmlDeclaration,
        format,
        uniqueIdElements,
      });
      return {
        leafContent: {},
        leafCount,
        hasNestedElements: true,
      };
    }
  }

  // Leaf element
  return {
    leafContent: {
      [key]: [element],
    },
    leafCount: leafCount + 1,
    hasNestedElements,
  };
}
