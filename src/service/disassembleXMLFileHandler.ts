"use strict";

import { existsSync } from "node:fs";
import { stat, readdir, rm } from "node:fs/promises";
import { resolve, dirname, join, basename, extname } from "node:path";

import { logger } from "@src/index";
import { INDENT } from "@src/helpers/constants";
import { buildDisassembledFiles } from "@src/service/buildDisassembledFiles";

export class DisassembleXMLFileHandler {
  async disassemble(xmlAttributes: {
    filePath: string;
    uniqueIdElements?: string;
    prePurge?: boolean;
    postPurge?: boolean;
  }): Promise<void> {
    const {
      filePath,
      uniqueIdElements,
      prePurge = false,
      postPurge = false,
    } = xmlAttributes;
    const fileStat = await stat(filePath);

    if (fileStat.isFile()) {
      const resolvedPath = resolve(filePath);
      if (!resolvedPath.endsWith(".xml")) {
        logger.error(
          `The file path provided is not an XML file: ${resolvedPath}`,
        );
        return;
      }
      const dirPath = dirname(resolvedPath);
      await this.processFile({
        dirPath,
        filePath: resolvedPath,
        uniqueIdElements,
        prePurge,
        postPurge,
      });
    } else if (fileStat.isDirectory()) {
      const subFiles = await readdir(filePath);
      for (const subFile of subFiles) {
        const subFilePath = join(filePath, subFile);
        if (subFilePath.endsWith(".xml")) {
          await this.processFile({
            dirPath: filePath,
            filePath: subFilePath,
            uniqueIdElements,
            prePurge,
            postPurge,
          });
        }
      }
    }
  }

  async processFile(xmlAttributes: {
    dirPath: string;
    filePath: string;
    uniqueIdElements?: string;
    prePurge: boolean;
    postPurge: boolean;
  }): Promise<void> {
    const { dirPath, filePath, uniqueIdElements, prePurge, postPurge } =
      xmlAttributes;

    logger.debug(`Parsing file to disassemble: ${filePath}`);
    const fullName = basename(filePath, extname(filePath));
    const baseName = fullName.split(".")[0];

    let outputPath;
    outputPath = join(dirPath, baseName);

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
