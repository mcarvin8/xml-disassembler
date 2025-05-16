import { readFile } from "fs/promises";
import { parse as parseYaml } from "yaml";
import { parse as parseJson5 } from "json5";
import { parse as parseToml } from "smol-toml";
import { parse as parseIni } from "ini";

import { parseXML } from "./parseXML";

export async function parseToXmlObject(
  filePath: string,
): Promise<any | undefined> {
  if (filePath.endsWith(".xml")) {
    return await parseXML(filePath);
  }

  const fileContent = await readFile(filePath, "utf-8");
  let parsed: any;

  if (filePath.endsWith(".yaml") || filePath.endsWith(".yml")) {
    parsed = parseYaml(fileContent);
  } else if (filePath.endsWith(".json5")) {
    parsed = parseJson5(fileContent);
  } else if (filePath.endsWith(".json")) {
    parsed = JSON.parse(fileContent);
  } else if (filePath.endsWith(".toml")) {
    parsed = parseToml(fileContent);
  } else if (filePath.endsWith(".ini")) {
    parsed = parseIni(fileContent);
  }

  return parsed;
}
