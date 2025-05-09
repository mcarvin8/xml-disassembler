"use strict";

import { XmlElementParams, XmlElement } from "@src/types/types";

export async function parseElement(params: XmlElementParams): Promise<{
  leafContent: XmlElement;
  leafCount: number;
  hasNestedElements: boolean;
  nestedGroups: Record<string, XmlElement[]>;
}> {
  const { element, key, hasNestedElements } = params;

  const nestedGroups: Record<string, XmlElement[]> = {};

  const isArray = Array.isArray(element);
  const isObjectWithMultipleFields =
    typeof element === "object" &&
    element !== null &&
    Object.keys(element).length > 1;

  // Consider it nested if it's an array or a structured object
  const isNested = isArray || isObjectWithMultipleFields;

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
    [key]: element,
  };

  return {
    leafContent,
    leafCount: params.leafCount + 1,
    hasNestedElements,
    nestedGroups,
  };
}
