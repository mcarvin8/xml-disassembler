jest.mock("xml-diassemble", () => ({
  disassemble: jest.fn(),
  reassemble: jest.fn(),
  parse_xml_string: jest.fn(),
  build_xml_string_export: jest.fn(),
  transform_to_ini_export: jest.fn(),
  transform_to_json_export: jest.fn(),
  transform_to_json5_export: jest.fn(),
  transform_to_toml_export: jest.fn(),
  transform_to_yaml_export: jest.fn(),
}));

import {
  setLogLevel,
  logger,
  DisassembleXMLFileHandler,
  ReassembleXMLFileHandler,
  parseXmlString,
  buildXmlString,
  transformToIni,
  transformToJson,
  transformToJson5,
  transformToToml,
  transformToYaml,
} from "../src/index";

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

  it("should export DisassembleXMLFileHandler and ReassembleXMLFileHandler", () => {
    expect(DisassembleXMLFileHandler).toBeDefined();
    expect(ReassembleXMLFileHandler).toBeDefined();
  });

  it("should allow creating handler instances", () => {
    const disassembleHandler = new DisassembleXMLFileHandler();
    const reassembleHandler = new ReassembleXMLFileHandler();
    expect(disassembleHandler).toBeInstanceOf(DisassembleXMLFileHandler);
    expect(reassembleHandler).toBeInstanceOf(ReassembleXMLFileHandler);
  });

  it("should export and call setLogLevel", () => {
    expect(setLogLevel).toBeDefined();
    expect(() => setLogLevel("info")).not.toThrow();
  });

  it("should export logger", () => {
    expect(logger).toBeDefined();
    expect(logger.debug).toBeDefined();
    expect(logger.error).toBeDefined();
  });

  it("should export parseXmlString and return parsed element", () => {
    const xmlDiassemble = require("xml-diassemble");
    xmlDiassemble.parse_xml_string.mockReturnValue(
      '{"root":{"#text":"value"}}',
    );

    const result = parseXmlString("<root>value</root>");
    expect(result).toEqual({ root: { "#text": "value" } });
  });

  it("should export buildXmlString", () => {
    const xmlDiassemble = require("xml-diassemble");
    xmlDiassemble.build_xml_string_export.mockReturnValue("<root>value</root>");

    const result = buildXmlString({ root: { "#text": "value" } });
    expect(result).toBe("<root>value</root>");
  });

  it("should export format transformers", () => {
    const element = { root: { "#text": "value" } };
    const xmlDiassemble = require("xml-diassemble");

    xmlDiassemble.transform_to_ini_export.mockReturnValue("[root]\ntext=value");
    expect(transformToIni(element)).toBe("[root]\ntext=value");

    xmlDiassemble.transform_to_json_export.mockReturnValue("{}");
    expect(transformToJson(element)).toBe("{}");

    xmlDiassemble.transform_to_json5_export.mockReturnValue("{}");
    expect(transformToJson5(element)).toBe("{}");

    xmlDiassemble.transform_to_toml_export.mockReturnValue("[root]");
    expect(transformToToml(element)).toBe("[root]");

    xmlDiassemble.transform_to_yaml_export.mockReturnValue("root: {}");
    expect(transformToYaml(element)).toBe("root: {}");
  });
});
