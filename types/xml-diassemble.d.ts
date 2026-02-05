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
}
