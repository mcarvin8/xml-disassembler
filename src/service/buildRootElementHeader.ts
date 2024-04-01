"use strict";

import { XmlElement } from "@src/helpers/types";

export function buildRootElementHeader(
  rootElement: XmlElement,
  rootElementName: string,
): string {
  let rootElementHeader = `<${rootElementName}`;
  for (const [attrKey, attrValue] of Object.entries(rootElement)) {
    if (attrKey.startsWith("@")) {
      const cleanAttrKey = attrKey.slice(2); // Remove the "@" prefix
      rootElementHeader += ` ${cleanAttrKey}="${String(attrValue)}"`;
    }
  }
  rootElementHeader += ">";
  return rootElementHeader;
}
