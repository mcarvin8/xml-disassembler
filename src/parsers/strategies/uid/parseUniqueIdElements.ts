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

  const uniqueId = findUniqueIdInElement(element, uniqueIdElements.split(","));
  return uniqueId ?? createShortHash(element);
}

function findUniqueIdInElement(
  element: XmlElement,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = element[key];
    if (typeof value === "string") {
      return value;
    }
  }

  for (const key in element) {
    const child = element[key];
    if (typeof child === "object" && child !== null) {
      const childId = findUniqueIdInElement(child as XmlElement, keys);
      if (childId !== undefined) {
        return childId;
      }
    }
  }

  return undefined;
}

function createShortHash(element: XmlElement): string {
  const hash = createHash("sha256");
  hash.update(JSON.stringify(element));
  return hash.digest("hex").slice(0, 8);
}