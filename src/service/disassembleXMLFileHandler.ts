"use strict";

import { existsSync } from "node:fs";
import { stat, readdir, rm } from "node:fs/promises";
import { resolve, dirname, join, basename, extname } from "node:path";

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
    const fileStat = await stat(xmlPath);

    if (fileStat.isFile()) {
      const filePath = resolve(xmlPath);
      if (!filePath.endsWith(".xml")) {
        logger.error(`The file path ${filePath} is not an XML file.`);
        return;
      }
      const basePath = dirname(filePath);
      await this.processFile({
        xmlPath: basePath,
        filePath,
        uniqueIdElements,
        prePurge,
        postPurge,
      });
    } else if (fileStat.isDirectory()) {
      const files = await readdir(xmlPath);
      for (const file of files) {
        const filePath = join(xmlPath, file);
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
    const fullName = basename(filePath, extname(filePath));
    const baseName = fullName.split(".")[0];

    let outputPath;
    outputPath = join(xmlPath, baseName);

    if (prePurge && existsSync(outputPath))
      await rm(outputPath, { recursive: true });

    await buildDisassembledFiles(
      filePath,
      outputPath,
      uniqueIdElements,
      fullName,
      INDENT,
      postPurge,
    );
  }
}
