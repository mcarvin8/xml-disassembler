"use strict";

/**
 * Loads the xml-diassemble Neon addon. The native module is required;
 * the package will fail to load if it is not built.
 */

const nativeModule = require("xml-diassemble") as {
  disassemble: (
    filePath: string,
    uniqueIdElements?: string | null,
    strategy?: string | null,
    prePurge?: boolean,
    postPurge?: boolean,
    ignorePath?: string | null,
    format?: string | null,
  ) => void;
  reassemble: (
    filePath: string,
    fileExtension?: string | null,
    postPurge?: boolean,
  ) => void;
  parse_xml_string: (xmlStr: string) => string | null;
  build_xml_string_export: (elementJson: string) => string;
  transform_to_ini_export: (elementJson: string) => string;
  transform_to_json_export: (elementJson: string) => string;
  transform_to_json5_export: (elementJson: string) => string;
  transform_to_toml_export: (elementJson: string) => string;
  transform_to_yaml_export: (elementJson: string) => string;
};

export function callNativeDisassemble(
  filePath: string,
  uniqueIdElements?: string,
  strategy?: string,
  prePurge?: boolean,
  postPurge?: boolean,
  ignorePath?: string,
  format?: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      nativeModule.disassemble(
        filePath,
        uniqueIdElements ?? null,
        strategy ?? null,
        prePurge ?? false,
        postPurge ?? false,
        ignorePath ?? null,
        format ?? null,
      );
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export function callNativeReassemble(
  filePath: string,
  fileExtension?: string,
  postPurge?: boolean,
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      nativeModule.reassemble(
        filePath,
        fileExtension ?? null,
        postPurge ?? false,
      );
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

/** Parsed XML element structure (compatible with quickxml_to_serde / fast-xml-parser) */
export type XmlElement = Record<string, unknown>;

/**
 * Parse XML string into a structured object.
 * @returns The parsed XML element, or null if parsing failed.
 */
export function parseXmlString(xmlStr: string): XmlElement | null {
  const json = nativeModule.parse_xml_string(xmlStr);
  if (json == null) return null;
  return JSON.parse(json) as XmlElement;
}

/**
 * Build XML string from a structured element object.
 */
export function buildXmlString(element: XmlElement): string {
  return nativeModule.build_xml_string_export(JSON.stringify(element));
}

/**
 * Transform XML element to INI format.
 */
export function transformToIni(element: XmlElement): string {
  return nativeModule.transform_to_ini_export(JSON.stringify(element));
}

/**
 * Transform XML element to JSON format.
 */
export function transformToJson(element: XmlElement): string {
  return nativeModule.transform_to_json_export(JSON.stringify(element));
}

/**
 * Transform XML element to JSON5 format.
 */
export function transformToJson5(element: XmlElement): string {
  return nativeModule.transform_to_json5_export(JSON.stringify(element));
}

/**
 * Transform XML element to TOML format.
 */
export function transformToToml(element: XmlElement): string {
  return nativeModule.transform_to_toml_export(JSON.stringify(element));
}

/**
 * Transform XML element to YAML format.
 */
export function transformToYaml(element: XmlElement): string {
  return nativeModule.transform_to_yaml_export(JSON.stringify(element));
}
