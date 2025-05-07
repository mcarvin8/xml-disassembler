"use strict";

import { readFile } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";

import { logger } from "../index";
import { XML_PARSER_OPTION } from "../constants/constants";
import { XmlElement } from "../types/types";
import { stripWhitespaceTextNodes } from "./stripWhitespace";

/**
 * Parses an XML file from a path or a raw XML string.
 *
 * @param input - Either the file path of the XML file or the XML string itself.
 * @param isRawXml - Set to true if `input` is an XML string, otherwise it is treated as a file path.
 */
export async function parseXML(
  input: string,
  isRawXml: boolean = false,
): Promise<Record<string, XmlElement> | undefined> {
  const xmlParser = new XMLParser(XML_PARSER_OPTION);

  let xmlContent: string;
  if (isRawXml) {
    xmlContent = input;
  } else {
    try {
      xmlContent = await readFile(input, "utf-8");
    } catch (readError) {
      logger.error(
        `${input} could not be read. Check if the file exists and is accessible.`,
      );
      return undefined;
    }
  }

  try {
    const xmlParsed = xmlParser.parse(xmlContent, true) as Record<
      string,
      XmlElement
    >;
    const cleaned = stripWhitespaceTextNodes(xmlParsed);
    return cleaned;
  } catch (err) {
    logger.error(
      `${isRawXml ? "Provided XML string" : input} could not be parsed. Confirm formatting and try again.`,
    );
    return undefined;
  }
}
