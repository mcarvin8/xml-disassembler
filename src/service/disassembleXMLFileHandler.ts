import * as fs from "node:fs/promises";
import * as path from "node:path";
import { INDENT } from "@src/helpers/constants";
import { buildDisassembledFiles } from "@src/service/buildDisassembledFiles";

export class DisassembleXMLFileHandler {
  async disassemble(xmlAttributes: {
    xmlPath: string;
    xmlElement: string;
    uniqueIdElements?: string | undefined;
  }): Promise<void> {
    const { xmlPath, xmlElement, uniqueIdElements } = xmlAttributes;
    const files = await fs.readdir(xmlPath);
    for (const file of files) {
      const filePath = path.join(xmlPath, file);
      await this.processFile({
        xmlPath,
        filePath,
        uniqueIdElements,
        xmlElement,
      });
    }
  }

  async processFile(xmlAttributes: {
    xmlPath: string;
    filePath: string;
    xmlElement: string;
    uniqueIdElements?: string | undefined;
  }): Promise<void> {
    const { xmlPath, filePath, xmlElement, uniqueIdElements } = xmlAttributes;

    if (filePath.endsWith(".xml")) {
      console.log(`Parsing file: ${filePath}`);
      const xmlContent = await fs.readFile(filePath, "utf-8");
      const baseName = path
        .basename(filePath, path.extname(filePath))
        .split(".")[0];

      let outputPath;
      outputPath = path.join(xmlPath, baseName);
      buildDisassembledFiles(
        xmlContent,
        outputPath,
        uniqueIdElements,
        xmlElement,
        baseName,
        INDENT,
      );
    }
  }
}
