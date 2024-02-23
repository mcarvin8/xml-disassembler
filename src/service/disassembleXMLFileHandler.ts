import * as fs from "node:fs/promises";
import * as path from "node:path";
import { logger } from "@src/index";
import { INDENT } from "@src/helpers/constants";
import { buildDisassembledFiles } from "@src/service/buildDisassembledFiles";

export class DisassembleXMLFileHandler {
  async disassemble(xmlAttributes: {
    xmlPath: string;
    uniqueIdElements?: string;
    purge?: boolean;
  }): Promise<void> {
    const { xmlPath, uniqueIdElements, purge = false } = xmlAttributes;
    const fileStat = await fs.stat(xmlPath);

    if (!fileStat.isDirectory()) {
      logger.error("The provided xmlPath is not a directory.");
      throw new Error("The provided xmlPath is not a directory.");
    }
    const files = await fs.readdir(xmlPath);
    for (const file of files) {
      const filePath = path.join(xmlPath, file);
      await this.processFile({
        xmlPath,
        filePath,
        uniqueIdElements,
        purge,
      });
    }
  }

  async processFile(xmlAttributes: {
    xmlPath: string;
    filePath: string;
    uniqueIdElements?: string;
    purge?: boolean;
  }): Promise<void> {
    const { xmlPath, filePath, uniqueIdElements, purge } = xmlAttributes;

    if (filePath.endsWith(".xml")) {
      logger.debug(`Parsing file: ${filePath}`);
      const xmlContent = await fs.readFile(filePath, "utf-8");
      const fullName = path.basename(filePath, path.extname(filePath));
      const baseName = fullName.split(".")[0];

      let outputPath;
      outputPath = path.join(xmlPath, baseName);

      if (purge) {
        await fs.rm(outputPath, { recursive: true });
      }

      buildDisassembledFiles(
        xmlContent,
        outputPath,
        uniqueIdElements,
        fullName,
        INDENT,
      );
    }
  }
}
