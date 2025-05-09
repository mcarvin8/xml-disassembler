"use strict";

import { XmlElement } from "@src/types/types";

/**
 * Extracts XML attributes from a root element and returns them
 * as a new XmlElement suitable for use as part of a grouped element.
 */
export function extractRootAttributes(rootElement: XmlElement): XmlElement {
  const attributesOnly: XmlElement = {};
  for (const [attrKey, attrValue] of Object.entries(rootElement)) {
    if (attrKey.startsWith("@")) {
      attributesOnly[attrKey] = attrValue;
    }
  }
  return attributesOnly;
}
