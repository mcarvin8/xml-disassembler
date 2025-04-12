"use strict";

import { readFile, readdir, stat, rm } from "node:fs/promises";
import { join, dirname, basename } from "node:path/posix";
import { parse as parseYaml } from "yaml";
import { parse as parseJson5 } from "json5";
import { parse as parseToml } from "smol-toml";

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

      if (fileStat.isFile()) {
        if (/\.(xml|json|json5|ya?ml|toml)$/.test(file)) {
          const parsedObject = await this.parseToXmlObject(filePath);
          if (parsedObject === undefined) continue;

          const rootResultFromFile = await parseRootElement(parsedObject);
          rootResult = rootResultFromFile;

          const combinedXmlString = buildXMLString(parsedObject);
          combinedXmlContents.push(combinedXmlString);
        }
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
  private async parseToXmlObject(filePath: string): Promise<any | undefined> {
    if (filePath.endsWith(".xml")) {
      return await parseXML(filePath);
    }

    const fileContent = await readFile(filePath, "utf-8");
    let parsed: any;

    if (filePath.endsWith(".yaml") || filePath.endsWith(".yml")) {
      parsed = parseYaml(fileContent);
    } else if (filePath.endsWith(".json5")) {
      parsed = parseJson5(fileContent);
    } else if (filePath.endsWith(".json")) {
      parsed = JSON.parse(fileContent);
    } else if (filePath.endsWith(".toml")) {
      parsed = parseToml(fileContent);
    }

    return parsed;
  }
}
