"use strict";

import { existsSync } from "node:fs";
import { stat, readdir, rm, readFile } from "node:fs/promises";
import { resolve, dirname, join, basename, extname, relative } from "node:path";
import ignore, { Ignore } from "ignore";

import { logger } from "@src/index";
import { buildDisassembledFilesUnified } from "@src/builders/buildDisassembledFiles";

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
    let {
      filePath,
      uniqueIdElements,
      strategy = "unique-id",
      prePurge = false,
      postPurge = false,
      ignorePath = ".xmldisassemblerignore",
      format = "xml",
    } = xmlAttributes;

    if (!["unique-id", "grouped-by-tag"].includes(strategy)) {
      logger.warn(
        `Unsupported strategy "${strategy}", defaulting to "unique-id".`,
      );
      strategy = "unique-id";
    }

    await this._loadIgnoreRules(ignorePath);

    const fileStat = await stat(filePath);
    const relativePath = this.posixPath(relative(process.cwd(), filePath));

    if (fileStat.isFile()) {
      await this._handleFile(filePath, relativePath, {
        uniqueIdElements,
        strategy,
        prePurge,
        postPurge,
        format,
      });
    } else if (fileStat.isDirectory()) {
      await this._handleDirectory(filePath, {
        uniqueIdElements,
        strategy,
        prePurge,
        postPurge,
        format,
        ignorePath,
      });
    }
  }

  private async _loadIgnoreRules(ignorePath: string): Promise<void> {
    const resolvedIgnorePath = resolve(ignorePath);
    if (existsSync(resolvedIgnorePath)) {
      const content = await readFile(resolvedIgnorePath);
      this.ign.add(content.toString());
    }
  }

  private async _handleFile(
    filePath: string,
    relativePath: string,
    options: {
      uniqueIdElements?: string;
      strategy: string;
      prePurge: boolean;
      postPurge: boolean;
      format: string;
    },
  ): Promise<void> {
    const resolvedPath = resolve(filePath);
    if (!this._isXmlFile(resolvedPath)) {
      logger.error(
        `The file path provided is not an XML file: ${resolvedPath}`,
      );
      return;
    }

    if (this.ign.ignores(relativePath)) {
      logger.warn(`File ignored by ignore rules: ${resolvedPath}`);
      return;
    }

    const dirPath = dirname(resolvedPath);
    await this.processFile({
      ...options,
      dirPath,
      filePath: resolvedPath,
    });
  }

  private async _handleDirectory(
    dirPath: string,
    options: {
      uniqueIdElements?: string;
      strategy: string;
      prePurge: boolean;
      postPurge: boolean;
      format: string;
      ignorePath: string;
    },
  ): Promise<void> {
    const subFiles = await readdir(dirPath);
    for (const subFile of subFiles) {
      const subFilePath = join(dirPath, subFile);
      const relativeSubFilePath = this.posixPath(
        relative(process.cwd(), subFilePath),
      );

      if (
        this._isXmlFile(subFilePath) &&
        !this.ign.ignores(relativeSubFilePath)
      ) {
        await this.processFile({
          ...options,
          dirPath,
          filePath: subFilePath,
        });
      } else if (this.ign.ignores(relativeSubFilePath)) {
        logger.warn(`File ignored by ignore rules: ${subFilePath}`);
      }
    }
  }

  private _isXmlFile(filePath: string): boolean {
    return filePath.endsWith(".xml");
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
    const outputPath = join(dirPath, baseName);

    if (prePurge && existsSync(outputPath)) {
      await rm(outputPath, { recursive: true });
    }

    await buildDisassembledFilesUnified({
      filePath,
      disassembledPath: outputPath,
      uniqueIdElements,
      baseName: fullName,
      postPurge,
      format,
      strategy,
    });
  }

  private posixPath(path: string): string {
    return path.replace(/\\+/g, "/");
  }
}
