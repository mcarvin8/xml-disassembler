import { readFile } from "node:fs/promises";

import {
  setLogLevel,
  logger,
  parseXML,
  buildXMLString,
  XmlElement,
} from "../src/index";
import { stripWhitespaceTextNodes } from "../src/parsers/stripWhitespace";
import { mergeXmlElements } from "../src/builders/mergeXmlElements";

setLogLevel("debug");

describe("function/index tests", () => {
  beforeEach(async () => {
    jest.spyOn(logger, "debug");
    jest.spyOn(logger, "error");
    jest.spyOn(logger, "warn");
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  it("should test parsing and building an XML with the exported functions.", async () => {
    const result = await parseXML(
      "samples/ignore/HR_Admin.permissionset-meta.xml",
    );
    await buildXMLString(result as XmlElement);

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should log an error and return undefined when the file cannot be read", async () => {
    const result = await parseXML("non-existent-file.xml");

    expect(result).toBeUndefined();
    expect(logger.error).toHaveBeenCalledWith(
      "non-existent-file.xml was unabled to be parsed and will not be processed. Confirm formatting and try again.",
    );
  });
  it("should remove objects from an array if they only contain a whitespace #text node", () => {
    const input = [{ "#text": "   " }, { "#text": "keep me" }];
    const result = stripWhitespaceTextNodes(input);
    expect(result).toEqual([{ "#text": "keep me" }]);
  });
  it("should confirm reassemble error condition (nothing to merge).", async () => {
    const result = mergeXmlElements([]);

    expect(result).toBeUndefined();
    expect(logger.error).toHaveBeenCalledWith("No elements to merge.");
  });
});
