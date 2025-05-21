"use strict";

import { XmlElement } from "@src/types/types";

/**
 * Extracts XML attributes from a root element and returns them
 * as a flat map of string attributes.
 */
export function extractRootAttributes(
  element: XmlElement,
): Record<string, string> {
  const attributes: Record<string, string> = {};

  for (const [key, value] of Object.entries(element)) {
    if (key.startsWith("@") && typeof value === "string") {
      attributes[key] = value;
    }
  }

  return attributes;
}
