"use strict";

import { createHash } from "node:crypto";
import { XmlElement } from "@src/types/types";

// Cache for stringified elements to avoid redundant JSON.stringify
const stringifyCache = new WeakMap<object, string>();

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

    if (!isObject(child)) continue;

    const result = parseUniqueIdElement(child as XmlElement, uniqueIdElements);
    if (result) return result;
  }
}

function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function createShortHash(element: XmlElement): string {
  // Keep SHA-256 for backward compatibility with existing file structures
  // Cache stringified elements to avoid redundant JSON.stringify calls
  let stringified = stringifyCache.get(element);
  if (!stringified) {
    stringified = JSON.stringify(element);
    stringifyCache.set(element, stringified);
  }

  const hash = createHash("sha256").update(stringified).digest("hex");
  return hash.slice(0, 8);
}
