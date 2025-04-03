"use strict";

import { readdir, stat, rm } from "node:fs/promises";
import { join, dirname, basename } from "node:path/posix";

import { logger } from "@src/index";
import { buildReassembledFile } from "@src/builders/buildReassembledFiles";
import { buildXMLString } from "@src/builders/buildXMLString";
import { parseXML } from "@src/parsers/parseXML";
import { parseRootElement } from "@src/parsers/parseRootElement";

export class ReassembleXMLFileHandler {
  async processFilesInDirectory(
    dirPath: string,
  ): Promise<[string[], [string, string | undefined, string] | undefined]> {
    const combinedXmlContents: string[] = [];
    let rootResult: [string, string | undefined, string] | undefined =
      undefined;
    const files = await readdir(dirPath);

    // Sort files based on the name
    files.sort((fileA, fileB) => {
      const fullNameA = fileA.split(".")[0].toLowerCase();
      const fullNameB = fileB.split(".")[0].toLowerCase();
      return fullNameA.localeCompare(fullNameB);
    });

    for (const file of files) {
      const filePath = join(dirPath, file);
      const fileStat = await stat(filePath);
      if (fileStat.isFile() && filePath.endsWith(".xml")) {
        const xmlParsed = await parseXML(filePath);
        if (xmlParsed === undefined) continue;
        const rootResultFromFile = await parseRootElement(xmlParsed);
        rootResult = rootResultFromFile;
        const combinedXmlString = buildXMLString(xmlParsed);
        combinedXmlContents.push(combinedXmlString);
      } else if (fileStat.isDirectory()) {
        const [subCombinedXmlContents, subRootResult] =
          await this.processFilesInDirectory(filePath);
        combinedXmlContents.push(...subCombinedXmlContents);
        rootResult = subRootResult;
      }
    }
    return [combinedXmlContents, rootResult];
  }

  async reassemble(xmlAttributes: {
    filePath: string;
    fileExtension?: string;
    postPurge?: boolean;
  }): Promise<void> {
    const { filePath, fileExtension, postPurge = false } = xmlAttributes;
    let combinedXmlContents: string[] = [];
    const fileStat = await stat(filePath);

    if (!fileStat.isDirectory()) {
      logger.error(
        `The provided path to reassemble is not a directory: ${filePath}`,
      );
      return;
    }
    logger.debug(`Parsing directory to reassemble: ${filePath}`);
    const [subCombinedXmlContents, rootResult] =
      await this.processFilesInDirectory(filePath);
    combinedXmlContents = subCombinedXmlContents;

    const parentDirectory = dirname(filePath);
    const subdirectoryBasename = basename(filePath);
    const fileName = fileExtension
      ? `${subdirectoryBasename}.${fileExtension}`
      : `${subdirectoryBasename}.xml`;
    const outputPath = join(parentDirectory, fileName);

    if (rootResult !== undefined) {
      const [rootElementName, rootElementHeader, xmlDeclarationStr] =
        rootResult;
      await buildReassembledFile(
        combinedXmlContents,
        outputPath,
        rootElementName,
        rootElementHeader,
        xmlDeclarationStr,
      );
      if (postPurge) await rm(filePath, { recursive: true });
    } else {
      logger.error(
        `No files under ${filePath} were parsed successfully. A reassembled XML file was not created.`,
      );
    }
  }
}
