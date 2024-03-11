import * as fs from "node:fs/promises";
import * as path from "node:path";
import { logger } from "@src/index";
import { INDENT } from "@src/helpers/constants";
import { buildDisassembledFiles } from "@src/service/buildDisassembledFiles";

export class DisassembleXMLFileHandler {
  async disassemble(xmlAttributes: {
    xmlPath: string;
    uniqueIdElements?: string;
    prePurge?: boolean;
    postPurge?: boolean;
  }): Promise<void> {
    const {
      xmlPath,
      uniqueIdElements,
      prePurge = false,
      postPurge = false,
    } = xmlAttributes;
    const fileStat = await fs.stat(xmlPath);

    if (fileStat.isFile()) {
      const filePath = path.resolve(xmlPath);
      if (!filePath.endsWith(".xml")) {
        logger.error(`The file path ${filePath} is not an XML file.`);
        return;
      }
      const basePath = path.dirname(filePath);
      await this.processFile({
        xmlPath: basePath,
        filePath,
        uniqueIdElements,
        prePurge,
        postPurge,
      });
    } else if (fileStat.isDirectory()) {
      const files = await fs.readdir(xmlPath);
      for (const file of files) {
        const filePath = path.join(xmlPath, file);
        if (filePath.endsWith(".xml")) {
          await this.processFile({
            xmlPath,
            filePath,
            uniqueIdElements,
            prePurge,
            postPurge,
          });
        }
      }
    }
  }

  async processFile(xmlAttributes: {
    xmlPath: string;
    filePath: string;
    uniqueIdElements?: string;
    prePurge: boolean;
    postPurge: boolean;
  }): Promise<void> {
    const { xmlPath, filePath, uniqueIdElements, prePurge, postPurge } =
      xmlAttributes;

    logger.debug(`Parsing file to disassemble: ${filePath}`);
    const xmlContent = await fs.readFile(filePath, "utf-8");
    const fullName = path.basename(filePath, path.extname(filePath));
    const baseName = fullName.split(".")[0];

    let outputPath;
    outputPath = path.join(xmlPath, baseName);

    if (prePurge) {
      await fs.rm(outputPath, { recursive: true });
    }

    buildDisassembledFiles(
      xmlContent,
      outputPath,
      uniqueIdElements,
      fullName,
      INDENT,
      postPurge,
      xmlPath,
    );
  }
}
