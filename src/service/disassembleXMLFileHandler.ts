"use strict";

import { existsSync } from "node:fs";
import { stat, readdir, rm, readFile } from "node:fs/promises";
import { resolve, dirname, join, basename, extname, relative } from "node:path";

import ignore, { Ignore } from "ignore";

import { logger } from "@src/index";
import { INDENT } from "@src/helpers/constants";
import { buildDisassembledFiles } from "@src/service/buildDisassembledFiles";
import { getConcurrencyThreshold } from "./getConcurrencyThreshold";

export class DisassembleXMLFileHandler {
  private readonly ign: Ignore = ignore();

  async disassemble(xmlAttributes: {
    filePath: string;
    uniqueIdElements?: string;
    prePurge?: boolean;
    postPurge?: boolean;
    ignorePath?: string;
  }): Promise<void> {
    const {
      filePath,
      uniqueIdElements,
      prePurge = false,
      postPurge = false,
      ignorePath = ".xmldisassemblerignore",
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
        filePath: resolvedPath,
        uniqueIdElements,
        prePurge,
        postPurge,
      });
    } else if (fileStat.isDirectory()) {
      const subFiles = await readdir(filePath);

      const concurrencyLimit = getConcurrencyThreshold();
      const activePromises: Promise<void>[] = [];
      let currentIndex = 0;

      // Function to process a single file
      const processSubFile = async (subFile: string) => {
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
            filePath: subFilePath,
            uniqueIdElements,
            prePurge,
            postPurge,
          });
        } else if (this.ign.ignores(relativeSubFilePath)) {
          logger.warn(`File ignored by ${ignorePath}: ${subFilePath}`);
        }
      };

      while (currentIndex < subFiles.length || activePromises.length > 0) {
        if (
          currentIndex < subFiles.length &&
          activePromises.length < concurrencyLimit
        ) {
          const subFile = subFiles[currentIndex++];
          const promise = processSubFile(subFile).finally(() => {
            activePromises.splice(activePromises.indexOf(promise), 1);
          });
          activePromises.push(promise);
        } else {
          await Promise.race(activePromises); // Wait for any promise to resolve
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

    let outputPath = join(dirPath, baseName);

    if (prePurge && existsSync(outputPath)) {
      await rm(outputPath, { recursive: true });
    }

    await buildDisassembledFiles(
      filePath,
      outputPath,
      uniqueIdElements,
      fullName,
      INDENT,
      postPurge,
    );
  }

  private posixPath(path: string): string {
    // Normalize path to POSIX-style (for cross-platform compatibility)
    return path.replace(/\\+/g, "/");
  }
}
