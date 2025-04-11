import {
  transformToYaml,
  transformToJson5,
  transformToJson,
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
    default:
      return undefined;
  }
}
