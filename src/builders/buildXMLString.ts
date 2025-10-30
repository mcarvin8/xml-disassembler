"use strict";

import { XMLBuilder } from "fast-xml-parser";
import { JSON_PARSER_OPTION } from "../constants/constants";
import { XmlElement } from "../types/types";

// Cache the builder instance to avoid recreation overhead
let cachedBuilder: XMLBuilder | null = null;

function getBuilder(): XMLBuilder {
  if (!cachedBuilder) {
    cachedBuilder = new XMLBuilder(JSON_PARSER_OPTION);
  }
  return cachedBuilder;
}

export function buildXMLString(element: XmlElement): string {
  const xmlBuilder = getBuilder();
  return xmlBuilder.build(element).trimEnd();
}
