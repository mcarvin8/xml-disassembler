"use strict";

import { XmlElement } from "@src/types/types";
import { buildRootElementHeader } from "@src/builders/buildRootElementHeader";
import { buildXMLDeclaration } from "@src/builders/buildXmlDeclaration";

export async function parseRootElement(
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
