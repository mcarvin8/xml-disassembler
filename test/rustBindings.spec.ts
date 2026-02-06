const mockDisassemble = jest.fn();
const mockReassemble = jest.fn();
const mockParseXmlString = jest.fn();
const mockBuildXmlStringExport = jest.fn();
const mockTransformToIniExport = jest.fn();
const mockTransformToJsonExport = jest.fn();
const mockTransformToJson5Export = jest.fn();
const mockTransformToTomlExport = jest.fn();
const mockTransformToYamlExport = jest.fn();

jest.mock("xml-diassemble", () => ({
  disassemble: (...args: unknown[]) => mockDisassemble(...args),
  reassemble: (...args: unknown[]) => mockReassemble(...args),
  parse_xml_string: (...args: unknown[]) => mockParseXmlString(...args),
  build_xml_string_export: (...args: unknown[]) =>
    mockBuildXmlStringExport(...args),
  transform_to_ini_export: (...args: unknown[]) =>
    mockTransformToIniExport(...args),
  transform_to_json_export: (...args: unknown[]) =>
    mockTransformToJsonExport(...args),
  transform_to_json5_export: (...args: unknown[]) =>
    mockTransformToJson5Export(...args),
  transform_to_toml_export: (...args: unknown[]) =>
    mockTransformToTomlExport(...args),
  transform_to_yaml_export: (...args: unknown[]) =>
    mockTransformToYamlExport(...args),
}));

import {
  callNativeDisassemble,
  callNativeReassemble,
  parseXmlString,
  buildXmlString,
  transformToIni,
  transformToJson,
  transformToJson5,
  transformToToml,
  transformToYaml,
} from "../src/rustBindings";

describe("rustBindings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("callNativeDisassemble", () => {
    it("should resolve when native disassemble succeeds", async () => {
      mockDisassemble.mockImplementation(() => {});

      await expect(
        callNativeDisassemble("/path/to/file.xml"),
      ).resolves.toBeUndefined();

      expect(mockDisassemble).toHaveBeenCalledWith(
        "/path/to/file.xml",
        null,
        null,
        false,
        false,
        null,
        null,
      );
    });

    it("should pass optional params to native disassemble", async () => {
      mockDisassemble.mockImplementation(() => {});

      await callNativeDisassemble(
        "/path/to/file.xml",
        "id",
        "hash",
        true,
        true,
        ".ignore",
        "json",
      );

      expect(mockDisassemble).toHaveBeenCalledWith(
        "/path/to/file.xml",
        "id",
        "hash",
        true,
        true,
        ".ignore",
        "json",
      );
    });

    it("should reject when native disassemble throws", async () => {
      const error = new Error("Native disassemble failed");
      mockDisassemble.mockImplementation(() => {
        throw error;
      });

      await expect(callNativeDisassemble("/path/to/file.xml")).rejects.toThrow(
        "Native disassemble failed",
      );
    });
  });

  describe("callNativeReassemble", () => {
    it("should resolve when native reassemble succeeds", async () => {
      mockReassemble.mockImplementation(() => {});

      await expect(
        callNativeReassemble("/path/to/file"),
      ).resolves.toBeUndefined();

      expect(mockReassemble).toHaveBeenCalledWith("/path/to/file", null, false);
    });

    it("should reject when native reassemble throws", async () => {
      const error = new Error("Native reassemble failed");
      mockReassemble.mockImplementation(() => {
        throw error;
      });

      await expect(callNativeReassemble("/path/to/file")).rejects.toThrow(
        "Native reassemble failed",
      );
    });
  });

  describe("parseXmlString", () => {
    it("should return parsed element when native returns JSON", () => {
      mockParseXmlString.mockReturnValue('{"root":{"#text":"value"}}');

      expect(parseXmlString("<root>value</root>")).toEqual({
        root: { "#text": "value" },
      });
    });

    it("should return null when native returns null", () => {
      mockParseXmlString.mockReturnValue(null);

      expect(parseXmlString("invalid")).toBeNull();
    });
  });

  describe("buildXmlString", () => {
    it("should return XML string from element", () => {
      mockBuildXmlStringExport.mockReturnValue("<root>value</root>");

      expect(buildXmlString({ root: { "#text": "value" } })).toBe(
        "<root>value</root>",
      );
    });
  });

  describe("transformers", () => {
    const element = { root: { "#text": "value" } };

    it("transformToIni should call native and return result", () => {
      mockTransformToIniExport.mockReturnValue("[root]\ntext=value");

      expect(transformToIni(element)).toBe("[root]\ntext=value");
      expect(mockTransformToIniExport).toHaveBeenCalledWith(
        JSON.stringify(element),
      );
    });

    it("transformToJson should call native and return result", () => {
      mockTransformToJsonExport.mockReturnValue('{"root":{"#text":"value"}}');

      expect(transformToJson(element)).toBe('{"root":{"#text":"value"}}');
    });

    it("transformToJson5 should call native and return result", () => {
      mockTransformToJson5Export.mockReturnValue("{root:{'#text':'value'}}");

      expect(transformToJson5(element)).toBe("{root:{'#text':'value'}}");
    });

    it("transformToToml should call native and return result", () => {
      mockTransformToTomlExport.mockReturnValue('[root]\ntext = "value"');

      expect(transformToToml(element)).toBe('[root]\ntext = "value"');
    });

    it("transformToYaml should call native and return result", () => {
      mockTransformToYamlExport.mockReturnValue("root:\n  '#text': value");

      expect(transformToYaml(element)).toBe("root:\n  '#text': value");
    });
  });
});
