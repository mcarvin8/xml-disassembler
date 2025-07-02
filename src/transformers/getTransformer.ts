import {
  transformToYaml,
  transformToJson5,
  transformToJson,
  transformToToml,
  transformToIni,
} from "@src/transformers/transformers";
import { XmlElement } from "@src/types/types";

const transformers: Record<
  string,
  (xmlContent: XmlElement) => Promise<string>
> = {
  yaml: transformToYaml,
  json5: transformToJson5,
  json: transformToJson,
  toml: transformToToml,
  ini: transformToIni,
};

export function getTransformer(
  format: string,
): ((xmlContent: XmlElement) => Promise<string>) | undefined {
  return transformers[format];
}
