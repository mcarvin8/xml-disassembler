"use strict";

import { readFile } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";

import { logger } from "../index";
import { XML_PARSER_OPTION } from "../constants/constants";
import { XmlElement } from "../types/types";
import { stripWhitespaceTextNodes } from "./stripWhitespace";

export async function parseXML(
  filePath: string,
): Promise<Record<string, XmlElement> | undefined> {
  const xmlParser = new XMLParser(XML_PARSER_OPTION);
  const xmlContent = await readFile(filePath, "utf-8");
  let xmlParsed: Record<string, XmlElement>;

  try {
    xmlParsed = xmlParser.parse(xmlContent, true) as Record<string, XmlElement>;

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
