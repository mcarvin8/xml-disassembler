"use strict";
export const INDENT = "    ";
export const XML_PARSER_OPTION = {
  commentPropName: "!---",
  ignoreAttributes: false,
  ignoreNameSpace: false,
  parseTagValue: false,
  parseNodeValue: false,
  parseAttributeValue: false,
  trimValues: false,
  processEntities: false,
  cdataPropName: "![CDATA[",
};
export const JSON_PARSER_OPTION = {
  ...XML_PARSER_OPTION,
  format: true,
  indentBy: INDENT,
  suppressBooleanAttributes: false,
  suppressEmptyNode: false,
};
