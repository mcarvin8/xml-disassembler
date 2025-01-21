"use strict";

import { readdir, stat, rm } from "node:fs/promises";
import { join, dirname, basename } from "node:path/posix";

import { logger } from "@src/index";
import { buildReassembledFile } from "@src/service/buildReassembledFiles";
import { buildXMLString } from "@src/service/buildXMLString";
import { parseXML } from "@src/service/parseXML";
import { processFilesForRootElement } from "@src/service/processFilesForRootElement";
import { getConcurrencyThreshold } from "./getConcurrencyThreshold";
import { withConcurrencyLimit } from "./withConcurrencyLimit";

export class ReassembleXMLFileHandler {
  async processFilesInDirectory(
    dirPath: string,
  ): Promise<[string[], [string, string | undefined] | undefined]> {
    const files = await readdir(dirPath);

    // Sort files based on the name
    files.sort((fileA, fileB) => {
      const fullNameA = fileA.split(".")[0].toLowerCase();
      const fullNameB = fileB.split(".")[0].toLowerCase();
      return fullNameA.localeCompare(fullNameB);
    });

    const combinedXmlContents: string[] = [];
    let rootResult: [string, string | undefined] | undefined = undefined;

    const concurrencyLimit = getConcurrencyThreshold();

    // Create tasks for processing files
    const tasks: (() => Promise<void>)[] = files.map((file, index) => {
      return async () => {
        const filePath = join(dirPath, file);
        const fileStat = await stat(filePath);

        if (fileStat.isFile() && filePath.endsWith(".xml")) {
          const xmlParsed = await parseXML(filePath);
          if (xmlParsed === undefined) return;

          const rootResultFromFile =
            await processFilesForRootElement(xmlParsed);
          rootResult = rootResultFromFile;

          const combinedXmlString = buildXMLString(xmlParsed);
          combinedXmlContents[index] = combinedXmlString;
        } else if (fileStat.isDirectory()) {
          const [subCombinedXmlContents, subRootResult] =
            await this.processFilesInDirectory(filePath);
          rootResult = subRootResult;
          combinedXmlContents[index] = subCombinedXmlContents.join("");
        }
      };
    });

    // Execute tasks with concurrency limit
    await withConcurrencyLimit(tasks, concurrencyLimit);

    return [combinedXmlContents.filter(Boolean), rootResult];
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
      const [rootElementName, rootElementHeader] = rootResult;
      await buildReassembledFile(
        combinedXmlContents,
        outputPath,
        rootElementName,
        rootElementHeader,
      );
      if (postPurge) await rm(filePath, { recursive: true });
    } else {
      logger.error(
        `No files under ${filePath} were parsed successfully. A reassembled XML file was not created.`,
      );
    }
  }
}
