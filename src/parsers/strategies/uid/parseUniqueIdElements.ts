"use strict";

import { createHash } from "node:crypto";
import { XmlElement } from "@src/types/types";

export function parseUniqueIdElement(
  element: XmlElement,
  uniqueIdElements?: string,
): string {
  if (!uniqueIdElements) {
    return createShortHash(element);
  }

  const keys = uniqueIdElements.split(",");
  const match = searchForUniqueId(element, keys);

  return match ?? createShortHash(element);
}

function searchForUniqueId(
  node: any,
  keys: string[],
): string | undefined {
  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  for (const key of keys) {
    const value = node[key];
    if (typeof value === "string") {
      return value;
    }

    // If the value is an array, check each item
    if (Array.isArray(value)) {
      for (const item of value) {
        const found = searchForUniqueId(item, [key]);
        if (found) return found;
      }
    }

    // If the value is an object, check it recursively
    if (typeof value === "object" && value !== null) {
      const found = searchForUniqueId(value, [key]);
      if (found) return found;
    }
  }

  // Recurse into all child properties
  for (const prop in node) {
    const found = searchForUniqueId(node[prop], keys);
    if (found) return found;
  }

  return undefined;
}

function createShortHash(element: XmlElement): string {
  const hash = createHash("sha256");
  hash.update(JSON.stringify(element));
  return hash.digest("hex").slice(0, 8);
}
