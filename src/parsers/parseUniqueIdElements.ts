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

  const id =
    findDirectFieldMatch(element, uniqueIdElements.split(",")) ??
    findNestedFieldMatch(element, uniqueIdElements) ??
    createShortHash(element);

  return id;
}

function findDirectFieldMatch(
  element: XmlElement,
  fieldNames: string[],
): string | undefined {
  for (const name of fieldNames) {
    const value = element[name];
    if (typeof value === "string") {
      return value;
    }
  }
}

function findNestedFieldMatch(
  element: XmlElement,
  uniqueIdElements: string,
): string | undefined {
  for (const key in element) {
    const child = element[key];
    if (typeof child === "object" && child !== null) {
      const result = parseUniqueIdElement(
        child as XmlElement,
        uniqueIdElements,
      );
      if (result) return result;
    }
  }
}

function createShortHash(element: XmlElement): string {
  const hash = createHash("sha256")
    .update(JSON.stringify(element))
    .digest("hex");
  return hash.slice(0, 8);
}
