"use strict";

import { readFile, readdir, stat, rm, writeFile } from "node:fs/promises";
import { join, dirname, basename } from "node:path/posix";
import { parse as parseYaml } from "yaml";
import { parse as parseJson5 } from "json5";
import { parse as parseToml } from "smol-toml";
import { parse as parseIni } from "ini";

import { logger } from "@src/index";
import { parseXML } from "@src/parsers/parseXML";
import { buildXMLString } from "@src/index";

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
          const parsedObject = await this.parseToXmlObject(filePath);
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
      logger.error(`The provided path to reassemble is not a directory: ${filePath}`);
      return;
    }

    logger.debug(`Parsing directory to reassemble: ${filePath}`);
    const parsedXmlObjects = await this.processFilesInDirectory(filePath);

    if (!parsedXmlObjects.length) {
      logger.error(`No files under ${filePath} were parsed successfully. A reassembled XML file was not created.`);
      return;
    }

    const mergedXml = mergeXmlElements(parsedXmlObjects);
    const finalXmlString = buildXMLString(mergedXml);

    const parentDirectory = dirname(filePath);
    const subdirectoryBasename = basename(filePath);
    const fileName = fileExtension
      ? `${subdirectoryBasename}.${fileExtension}`
      : `${subdirectoryBasename}.xml`;
    const outputPath = join(parentDirectory, fileName);

    await writeFile(outputPath, finalXmlString, "utf-8");

    if (postPurge) {
      await rm(filePath, { recursive: true });
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
    } else if (filePath.endsWith(".ini")) {
      parsed = parseIni(fileContent);
    }

    return parsed;
  }
}

function mergeXmlElements(elements: XmlElement[]): XmlElement {
  if (elements.length === 0) throw new Error('No elements to merge.');

  const rootKey = Object.keys(elements[0])[1];
  const mergedContent: Record<string, any> = {};

  for (const element of elements) {
    const current = element[rootKey] as Record<string, any>;

    for (const [childKey, value] of Object.entries(current)) {
      if (Array.isArray(value)) {
        mergedContent[childKey] = mergedContent[childKey]
          ? mergedContent[childKey].concat(value)
          : [...value];
      } else if (typeof value === 'object') {
        mergedContent[childKey] = mergedContent[childKey]
          ? ([] as any[]).concat(mergedContent[childKey], value)
          : [value];
      } else {
        if (!mergedContent.hasOwnProperty(childKey)) {
          mergedContent[childKey] = value;
        }
      }
    }
  }

  return { [rootKey]: mergedContent };
}