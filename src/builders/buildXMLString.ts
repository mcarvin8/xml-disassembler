"use strict";

import { XMLBuilder } from "fast-xml-parser";
import { JSON_PARSER_OPTION } from "../constants/constants";
import { XmlElement } from "../types/types";

export function buildXMLString(element: XmlElement): string {
  const xmlBuilder = new XMLBuilder(JSON_PARSER_OPTION);
  return xmlBuilder.build(element).trimEnd();
}
