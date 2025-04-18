"use strict";

import { XmlElementParams, XmlElement } from "@src/types/types";

export async function parseElement(params: XmlElementParams): Promise<{
  leafContent: string;
  leafCount: number;
  hasNestedElements: boolean;
  nestedGroups: Record<string, XmlElement[]>;
}> {
  const { element, key, indent, leafContent, leafCount, hasNestedElements } =
    params;

  const nestedGroups: Record<string, XmlElement[]> = {};

  if (typeof element === "object") {
    if (!nestedGroups[key]) nestedGroups[key] = [];
    nestedGroups[key].push(element);
    return {
      leafContent,
      leafCount,
      hasNestedElements: true,
      nestedGroups,
    };
  } else {
    const updatedLeafContent = `${leafContent}${indent}<${key}>${String(element)}</${key}>\n`;
    return {
      leafContent: updatedLeafContent,
      leafCount: leafCount + 1,
      hasNestedElements,
      nestedGroups,
    };
  }
}
