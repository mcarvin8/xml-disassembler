"use strict";

import { XmlElement } from "@src/helpers/types";
import { buildRootElementHeader } from "@src/service/buildRootElementHeader";

export async function processFilesForRootElement(
  xmlParsed: Record<string, XmlElement>,
): Promise<[string, string | undefined]> {
  const rootElementName = Object.keys(xmlParsed)[1];
  const rootElement: XmlElement = xmlParsed[rootElementName];
  const rootElementHeader = buildRootElementHeader(
    rootElement,
    rootElementName,
  );
  return [rootElementName, rootElementHeader];
}
