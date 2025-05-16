"use strict";

import { readdir, stat, rm, writeFile } from "node:fs/promises";
import { join, dirname, basename } from "node:path/posix";

import { logger } from "@src/index";
import { buildXMLString } from "@src/index";
import { mergeXmlElements } from "@src/builders/mergeXmlElements";
import { parseToXmlObject } from "@src/parsers/parseToXmlObject";

export class ReassembleXMLFileHandler {
  async processFilesInDirectory(dirPath: string): Promise<any[]> {
    const parsedXmlObjects: any[] = [];
    const files = await readdir(dirPath);

    files.sort((fileA, fileB) => {
      const fullNameA = fileA.split(".")[0].toLowerCase();
      const fullNameB = fileB.split(".")[0].toLowerCase();
      return fullNameA.localeCompare(fullNameB);
    });

    for (const file of files) {
      const filePath = join(dirPath, file);
      const fileStat = await stat(filePath);

      if (fileStat.isFile()) {
        if (/\.(xml|json|json5|ya?ml|toml|ini)$/.test(file)) {
          const parsedObject = await parseToXmlObject(filePath);
          if (parsedObject === undefined) continue;

          parsedXmlObjects.push(parsedObject);
        }
      } else if (fileStat.isDirectory()) {
        const subParsedObjects = await this.processFilesInDirectory(filePath);
        parsedXmlObjects.push(...subParsedObjects);
      }
    }

    return parsedXmlObjects;
  }

  async reassemble(xmlAttributes: {
    filePath: string;
    fileExtension?: string;
    postPurge?: boolean;
  }): Promise<void> {
    const { filePath, fileExtension, postPurge = false } = xmlAttributes;
    const fileStat = await stat(filePath);

    if (!fileStat.isDirectory()) {
      logger.error(
        `The provided path to reassemble is not a directory: ${filePath}`,
      );
      return;
    }

    logger.debug(`Parsing directory to reassemble: ${filePath}`);
    const parsedXmlObjects = await this.processFilesInDirectory(filePath);

    if (!parsedXmlObjects.length) {
      logger.error(
        `No files under ${filePath} were parsed successfully. A reassembled XML file was not created.`,
      );
      return;
    }

    const mergedXml = mergeXmlElements(parsedXmlObjects);
    const xmlContent = buildXMLString(mergedXml);
    const finalXml = xmlContent;

    const parentDirectory = dirname(filePath);
    const subdirectoryBasename = basename(filePath);
    const fileName = fileExtension
      ? `${subdirectoryBasename}.${fileExtension}`
      : `${subdirectoryBasename}.xml`;
    const outputPath = join(parentDirectory, fileName);

    await writeFile(outputPath, finalXml, "utf-8");

    if (postPurge) {
      await rm(filePath, { recursive: true });
    }
  }
}
