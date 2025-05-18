"use strict";

import {
  XmlElementParams,
  XmlElement,
  XmlElementArrayMap,
} from "@src/types/types";

export async function parseElement(params: XmlElementParams): Promise<{
  leafContent: XmlElement;
  leafCount: number;
  hasNestedElements: boolean;
  nestedGroups: XmlElementArrayMap;
}> {
  const { element, key, hasNestedElements } = params;

  const nestedGroups: XmlElementArrayMap = {};

  const isArray = Array.isArray(element);
  const isNestedObject =
    typeof element === "object" &&
    element !== null &&
    Object.keys(element).some((k) => !k.startsWith("#")); // heuristic: anything beyond text/attrs is nested

  const isNested = isArray || isNestedObject;
  if (isNested) {
    nestedGroups[key] = [element];
    return {
      leafContent: {},
      leafCount: params.leafCount,
      hasNestedElements: true,
      nestedGroups,
    };
  }

  // Otherwise, it's a leaf element
  const leafContent: XmlElement = {
    [key]: [element],
  };

  return {
    leafContent,
    leafCount: params.leafCount + 1,
    hasNestedElements,
    nestedGroups,
  };
}
