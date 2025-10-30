"use strict";

import { readFile } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";

import { logger } from "../index";
import { XML_PARSER_OPTION } from "../constants/constants";
import { XmlElementMap } from "../types/types";
import { stripWhitespaceTextNodes } from "./stripWhitespace";

// Cache the parser instance to avoid recreation overhead
let cachedParser: XMLParser | null = null;

function getParser(): XMLParser {
  if (!cachedParser) {
    cachedParser = new XMLParser(XML_PARSER_OPTION);
  }
  return cachedParser;
}

/**
 * Parses an XML file from a path.
 *
 * @param filePath - file path of the XML file.
 */
export async function parseXML(
  filePath: string,
): Promise<XmlElementMap | undefined> {
  const xmlParser = getParser();
  let xmlParsed: XmlElementMap;
  try {
    const xmlContent = await readFile(filePath, "utf-8");
    xmlParsed = xmlParser.parse(xmlContent, true) as XmlElementMap;
    // ✅ Remove meaningless whitespace-only #text nodes
    const cleaned = stripWhitespaceTextNodes(xmlParsed);
    return cleaned;
  } catch (err) {
    logger.error(
      `${filePath} was unabled to be parsed and will not be processed. Confirm formatting and try again.`,
    );
    return undefined;
  }
}
