import { stringify as stringifyJson5 } from "json5";
import { stringify as stringifyToml } from "smol-toml";
import { stringify as stringifyIni } from "ini";
import { stringify as stringifyYaml } from "yaml";

import { XmlElement } from "../types/types";

export async function transformToYaml(parsedXml: XmlElement): Promise<string> {
  const yamlString = stringifyYaml(parsedXml);
  return yamlString;
}

export async function transformToJson5(parsedXml: XmlElement): Promise<string> {
  const jsonString = stringifyJson5(parsedXml, null, 2);
  return jsonString;
}

export async function transformToJson(parsedXml: XmlElement): Promise<string> {
  const jsonString = JSON.stringify(parsedXml, null, 2);
  return jsonString;
}

export async function transformToToml(parsedXml: XmlElement): Promise<string> {
  const tomlString = stringifyToml(parsedXml);
  return tomlString;
}

export async function transformToIni(parsedXml: XmlElement): Promise<string> {
  const iniString = stringifyIni(parsedXml);
  return iniString;
}
