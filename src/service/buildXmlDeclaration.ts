"use strict";

import { XML_DEFAULT_DECLARATION } from "../helpers/constants";
import { XmlElement } from "../helpers/types";

export function buildXMLDeclaration(
  parsedXml: Record<string, XmlElement>,
): string {
  // determine XML declartion
  let xmlDeclarationStr = XML_DEFAULT_DECLARATION;
  if (parsedXml["?xml"]) {
    const xmlDeclaration = parsedXml["?xml"];
    // Construct the XML declaration dynamically
    const attributes = Object.entries(xmlDeclaration)
      .map(([key, value]) => `${key.replace("@_", "")}="${value}"`)
      .join(" ");
    xmlDeclarationStr = `<?xml ${attributes}?>`;
  }

  return xmlDeclarationStr;
}
