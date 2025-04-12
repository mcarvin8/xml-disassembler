import {
  transformToYaml,
  transformToJson5,
  transformToJson,
  transformToToml,
  transformToIni,
} from "@src/transformers/transformers";

export function getTransformer(
  format: string,
): ((xmlPath: string) => Promise<void>) | undefined {
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
