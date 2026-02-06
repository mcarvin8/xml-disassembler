declare module "xml-diassemble" {
  export function hello(name: string): string;
  export function disassemble(
    filePath: string,
    uniqueIdElements?: string | null,
    strategy?: string | null,
    prePurge?: boolean,
    postPurge?: boolean,
    ignorePath?: string | null,
    format?: string | null,
  ): void;
  export function reassemble(
    filePath: string,
    fileExtension?: string | null,
    postPurge?: boolean,
  ): void;
  export function parse_xml_string(xmlStr: string): string | null;
  export function build_xml_string_export(elementJson: string): string;
  export function transform_to_ini_export(elementJson: string): string;
  export function transform_to_json_export(elementJson: string): string;
  export function transform_to_json5_export(elementJson: string): string;
  export function transform_to_toml_export(elementJson: string): string;
  export function transform_to_yaml_export(elementJson: string): string;
}
