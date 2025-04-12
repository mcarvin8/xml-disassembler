import { writeFile } from "node:fs/promises";

import { logger } from "@src/index";
import { parseXML } from "@src/parsers/parseXML";
import { stringify as stringifyYaml } from "yaml";
import { stringify as stringifyJson5 } from "json5";
import { stringify as stringifyToml } from "smol-toml";

export async function transformToYaml(xmlPath: string): Promise<void> {
  const parsedXml = await parseXML(xmlPath);
  const yamlString = stringifyYaml(parsedXml);
  const yamlPath = xmlPath.replace(/\.xml$/, ".yaml");
  await writeFile(yamlPath, yamlString);
  logger.debug(`${xmlPath} has been transformed into ${yamlPath}`);
}

export async function transformToJson5(xmlPath: string): Promise<void> {
  const parsedXml = await parseXML(xmlPath);
  const jsonString = stringifyJson5(parsedXml, null, 2);
  const jsonPath = xmlPath.replace(/\.xml$/, ".json5");
  await writeFile(jsonPath, jsonString);
  logger.debug(`${xmlPath} has been transformed into ${jsonPath}`);
}

export async function transformToJson(xmlPath: string): Promise<void> {
  const parsedXml = await parseXML(xmlPath);
  const jsonString = JSON.stringify(parsedXml, null, 2);
  const jsonPath = xmlPath.replace(/\.xml$/, ".json");
  await writeFile(jsonPath, jsonString);
  logger.debug(`${xmlPath} has been transformed into ${jsonPath}`);
}

export async function transformToToml(xmlPath: string): Promise<void> {
  const parsedXml = await parseXML(xmlPath);
  const jsonString = stringifyToml(parsedXml);
  const jsonPath = xmlPath.replace(/\.xml$/, ".toml");
  await writeFile(jsonPath, jsonString);
  logger.debug(`${xmlPath} has been transformed into ${jsonPath}`);
}
