import { readFile } from "fs/promises";
import { parse as parseYaml } from "yaml";
import { parse as parseJson5 } from "json5";
import { parse as parseToml } from "smol-toml";
import { parse as parseIni } from "ini";

import { parseXML } from "./parseXML";

const parsers: Record<string, (content: string) => any> = {
  ".yaml": parseYaml,
  ".yml": parseYaml,
  ".json": JSON.parse,
  ".json5": parseJson5,
  ".toml": parseToml,
  ".ini": parseIni,
};

export async function parseToXmlObject(
  filePath: string,
): Promise<any | undefined> {
  if (filePath.endsWith(".xml")) {
    return await parseXML(filePath);
  }

  const ext = Object.keys(parsers).find((ext) => filePath.endsWith(ext));

  const fileContent = await readFile(filePath, "utf-8");
  return parsers[ext!](fileContent);
}
