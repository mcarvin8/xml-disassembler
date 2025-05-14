import {
  transformToYaml,
  transformToJson5,
  transformToJson,
  transformToToml,
  transformToIni,
} from "@src/transformers/transformers";
import { XmlElement } from "@src/types/types";

export function getTransformer(
  format: string,
): ((xmlContent: XmlElement) => Promise<string>) | undefined {
  switch (format) {
    case "yaml":
      return transformToYaml;
    case "json5":
      return transformToJson5;
    case "json":
      return transformToJson;
    case "toml":
      return transformToToml;
    case "ini":
      return transformToIni;
    default:
      return undefined;
  }
}
