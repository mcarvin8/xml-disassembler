"use strict";

import { readFile } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";

import { logger } from "../index";
import { XML_PARSER_OPTION, XmlElement } from "../helpers/types";

export async function parseXML(
  filePath: string,
): Promise<Record<string, XmlElement> | undefined> {
  const xmlParser = new XMLParser(XML_PARSER_OPTION);
  const xmlContent = await readFile(filePath, "utf-8");
  let xmlParsed: Record<string, XmlElement>;
  try {
    xmlParsed = xmlParser.parse(xmlContent, true) as Record<string, XmlElement>;
    return xmlParsed;
  } catch (err) {
    logger.error(
      `${filePath} was unabled to be parsed and will not be processed. Confirm formatting and try again.`,
    );
    return undefined;
  }
}
