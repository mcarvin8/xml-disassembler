"use strict";

import { readdir, stat, rm, writeFile } from "node:fs/promises";
import { join, dirname, basename } from "node:path/posix";

import { logger } from "@src/index";
import { buildXMLString } from "@src/index";
import { mergeXmlElements } from "@src/builders/mergeXmlElements";
import { parseToXmlObject } from "@src/parsers/parseToXmlObject";

export class ReassembleXMLFileHandler {
  async reassemble(xmlAttributes: {
    filePath: string;
    fileExtension?: string;
    postPurge?: boolean;
  }): Promise<void> {
    const { filePath, fileExtension, postPurge = false } = xmlAttributes;

    if (!(await this._validateDirectory(filePath))) return;

    logger.debug(`Parsing directory to reassemble: ${filePath}`);
    const parsedXmlObjects = await this.processFilesInDirectory(filePath);

    if (!parsedXmlObjects.length) {
      this._logEmptyParseError(filePath);
      return;
    }

    const mergedXml = mergeXmlElements(parsedXmlObjects)!;
    const finalXml = buildXMLString(mergedXml);
    const outputPath = this._getOutputPath(filePath, fileExtension);

    await writeFile(outputPath, finalXml, "utf-8");
    if (postPurge) await rm(filePath, { recursive: true });
  }

  async processFilesInDirectory(dirPath: string): Promise<any[]> {
    const parsedXmlObjects: any[] = [];
    const files = await readdir(dirPath);

    files.sort((a, b) => a.split(".")[0].localeCompare(b.split(".")[0]));

    for (const file of files) {
      const filePath = join(dirPath, file);
      const fileStat = await stat(filePath);

      if (
        fileStat.isFile() &&
        /\.(xml|json|json5|ya?ml|toml|ini)$/.test(file)
      ) {
        const parsed = await parseToXmlObject(filePath);
        if (parsed) parsedXmlObjects.push(parsed);
      } else if (fileStat.isDirectory()) {
        const subParsed = await this.processFilesInDirectory(filePath);
        parsedXmlObjects.push(...subParsed);
      }
    }

    return parsedXmlObjects;
  }

  private async _validateDirectory(path: string): Promise<boolean> {
    const stats = await stat(path);
    if (!stats.isDirectory()) {
      logger.error(
        `The provided path to reassemble is not a directory: ${path}`,
      );
      return false;
    }
    return true;
  }

  private _logEmptyParseError(path: string): void {
    logger.error(
      `No files under ${path} were parsed successfully. A reassembled XML file was not created.`,
    );
  }

  private _getOutputPath(dirPath: string, extension?: string): string {
    const parentDir = dirname(dirPath);
    const baseName = basename(dirPath);
    const fileName = `${baseName}.${extension ?? "xml"}`;
    return join(parentDir, fileName);
  }
}
