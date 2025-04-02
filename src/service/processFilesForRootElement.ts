"use strict";

import { XmlElement } from "@src/helpers/types";
import { buildRootElementHeader } from "@src/service/buildRootElementHeader";
import { buildXMLDeclaration } from "@src/service/buildXmlDeclaration";

export async function processFilesForRootElement(
  xmlParsed: Record<string, XmlElement>,
): Promise<[string, string | undefined, string]> {
  const xmlDeclarationStr = buildXMLDeclaration(xmlParsed);
  const rootElementName = Object.keys(xmlParsed)[1];
  const rootElement: XmlElement = xmlParsed[rootElementName];
  const rootElementHeader = buildRootElementHeader(
    rootElement,
    rootElementName,
  );
  return [rootElementName, rootElementHeader, xmlDeclarationStr];
}
