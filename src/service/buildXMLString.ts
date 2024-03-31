"use strict";

import { XMLBuilder } from "fast-xml-parser";

import { INDENT } from "@src/helpers/constants";
import { XmlElement, JSON_PARSER_OPTION } from "@src/helpers/types";

export function buildXMLString(
  element: XmlElement,
  indentLevel: number = 0,
): string {
  const xmlBuilder = new XMLBuilder(JSON_PARSER_OPTION);
  const xmlString = xmlBuilder.build(element) as string;

  // Manually format the XML string with the desired indentation
  const formattedXml: string = xmlString
    .split("\n")
    .map((line: string) => `${" ".repeat(indentLevel * INDENT.length)}${line}`)
    .join("\n")
    .trimEnd();

  return formattedXml;
}
