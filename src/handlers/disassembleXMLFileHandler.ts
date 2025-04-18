"use strict";

import { existsSync } from "node:fs";
import { stat, readdir, rm, readFile } from "node:fs/promises";
import { resolve, dirname, join, basename, extname, relative } from "node:path";

import ignore, { Ignore } from "ignore";

import { logger } from "@src/index";
import { INDENT } from "@src/constants/constants";
import { buildDisassembledFiles as buildDisassembledFilesUID } from "@src/builders/strategies/uid/buildDisassembledFiles";
import { buildDisassembledFiles as buildDissassembledFilesTag } from "@src/builders/strategies/grouped-by-tag/buildDisassembledFiles";

export class DisassembleXMLFileHandler {
  private readonly ign: Ignore = ignore();

  async disassemble(xmlAttributes: {
    filePath: string;
    uniqueIdElements?: string;
    strategy?: string;
    prePurge?: boolean;
    postPurge?: boolean;
    ignorePath?: string;
    format?: string;
  }): Promise<void> {
    const {
      filePath,
      uniqueIdElements,
      strategy = "unique-id",
      prePurge = false,
      postPurge = false,
      ignorePath = ".xmldisassemblerignore",
      format = "xml",
    } = xmlAttributes;
    const resolvedIgnorePath = resolve(ignorePath);
    if (existsSync(resolvedIgnorePath)) {
      const content = await readFile(resolvedIgnorePath);
      this.ign.add(content.toString());
    }

    const fileStat = await stat(filePath);
    const relativePath = this.posixPath(relative(process.cwd(), filePath));

    if (fileStat.isFile()) {
      const resolvedPath = resolve(filePath);
      if (!resolvedPath.endsWith(".xml")) {
        logger.error(
          `The file path provided is not an XML file: ${resolvedPath}`,
        );
        return;
      }
      if (this.ign.ignores(relativePath)) {
        logger.warn(`File ignored by ${ignorePath}: ${resolvedPath}`);
        return;
      }
      const dirPath = dirname(resolvedPath);
      await this.processFile({
        dirPath,
        strategy,
        filePath: resolvedPath,
        uniqueIdElements,
        prePurge,
        postPurge,
        format,
      });
    } else if (fileStat.isDirectory()) {
      const subFiles = await readdir(filePath);
      for (const subFile of subFiles) {
        const subFilePath = join(filePath, subFile);
        const relativeSubFilePath = this.posixPath(
          relative(process.cwd(), subFilePath),
        );
        if (
          subFilePath.endsWith(".xml") &&
          !this.ign.ignores(relativeSubFilePath)
        ) {
          await this.processFile({
            dirPath: filePath,
            strategy,
            filePath: subFilePath,
            prePurge,
            postPurge,
            format,
          });
        } else if (this.ign.ignores(relativeSubFilePath)) {
          logger.warn(`File ignored by ${ignorePath}: ${subFilePath}`);
        }
      }
    }
  }

  async processFile(xmlAttributes: {
    dirPath: string;
    strategy: string;
    filePath: string;
    uniqueIdElements?: string;
    prePurge: boolean;
    postPurge: boolean;
    format: string;
  }): Promise<void> {
    const {
      dirPath,
      strategy,
      filePath,
      uniqueIdElements,
      prePurge,
      postPurge,
      format,
    } = xmlAttributes;

    logger.debug(`Parsing file to disassemble: ${filePath}`);
    const fullName = basename(filePath, extname(filePath));
    const baseName = fullName.split(".")[0];

    let outputPath;
    outputPath = join(dirPath, baseName);

    if (prePurge && existsSync(outputPath))
      await rm(outputPath, { recursive: true });

    if (strategy === "grouped-by-tag") {
      await buildDissassembledFilesTag(
        filePath,
        outputPath,
        fullName,
        INDENT,
        postPurge,
        format,
      );
    } else {
      await buildDisassembledFilesUID(
        filePath,
        outputPath,
        uniqueIdElements,
        fullName,
        INDENT,
        postPurge,
        format,
      );
    }
  }

  private posixPath(path: string): string {
    // Normalize path to POSIX-style (for cross-platform compatibility)
    return path.replace(/\\+/g, "/");
  }
}
