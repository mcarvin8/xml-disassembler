"use strict";

import * as promises from "node:fs/promises";
import * as path from "node:path";
import { XMLParser } from "fast-xml-parser";

import { logger } from "@src/index";
import { XML_PARSER_OPTION } from "@src/helpers/types";
import { buildReassembledFile } from "@src/service/buildReassembledFiles";
import { buildRootElementHeader } from "@src/service/buildRootElementHeader";
import { buildXMLString } from "@src/service/buildXMLString";

const xmlParser = new XMLParser(XML_PARSER_OPTION);

interface XmlElement {
  [key: string]: string | XmlElement | string[] | XmlElement[];
}

export class ReassembleXMLFileHandler {
  async processFilesInDirectory(
    dirPath: string,
  ): Promise<[string[], [string, string | undefined] | undefined]> {
    const combinedXmlContents: string[] = [];
    let rootResult: [string, string | undefined] | undefined = undefined;

    const files = await promises.readdir(dirPath);

    // Sort files based on the name
    files.sort((fileA, fileB) => {
      const fullNameA = fileA.split(".")[0].toLowerCase();
      const fullNameB = fileB.split(".")[0].toLowerCase();
      return fullNameA.localeCompare(fullNameB);
    });

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const fileStat = await promises.stat(filePath);
      if (fileStat.isFile() && filePath.endsWith(".xml")) {
        const xmlContent = await promises.readFile(filePath, "utf-8");
        let xmlParsed: Record<string, XmlElement>;
        try {
          xmlParsed = xmlParser.parse(xmlContent, true) as Record<
            string,
            XmlElement
          >;
        } catch (err) {
          logger.error(
            `${filePath} was unable to be parsed and was not added to the reassembled file. Confirm formatting and try again.`,
          );
          continue;
        }
        const rootResultFromFile =
          await this.processFilesForRootElement(xmlParsed);
        if (rootResultFromFile && !rootResult) {
          rootResult = rootResultFromFile;
        }
        const combinedXmlString = buildXMLString(xmlParsed);
        combinedXmlContents.push(combinedXmlString);
      } else if (fileStat.isDirectory()) {
        const [subCombinedXmlContents, subRootResult] =
          await this.processFilesInDirectory(filePath);
        combinedXmlContents.push(...subCombinedXmlContents);
        if (subRootResult && !rootResult) {
          rootResult = subRootResult;
        }
      }
    }

    return [combinedXmlContents, rootResult];
  }

  async processFilesForRootElement(
    xmlParsed: Record<string, XmlElement>,
  ): Promise<[string, string | undefined]> {
    const rootElementName = Object.keys(xmlParsed)[1];
    const rootElement: XmlElement = xmlParsed[rootElementName];
    const rootElementHeader = buildRootElementHeader(
      rootElement,
      rootElementName,
    );
    return [rootElementName, rootElementHeader];
  }

  async reassemble(xmlAttributes: {
    xmlPath: string;
    fileExtension?: string;
    postPurge?: boolean;
  }): Promise<void> {
    const { xmlPath, fileExtension, postPurge = false } = xmlAttributes;
    let combinedXmlContents: string[] = [];
    const fileStat = await promises.stat(xmlPath);

    if (!fileStat.isDirectory()) {
      logger.error(
        `The provided xmlPath ${xmlPath} to reassemble is not a directory.`,
      );
      return;
    }
    logger.debug(`Parsing directory to reassemble: ${xmlPath}`);
    const [subCombinedXmlContents, rootResult] =
      await this.processFilesInDirectory(xmlPath);
    combinedXmlContents = subCombinedXmlContents;

    const parentDirectory = path.dirname(xmlPath);
    const subdirectoryBasename = path.basename(xmlPath);
    const fileName = fileExtension
      ? `${subdirectoryBasename}.${fileExtension}`
      : `${subdirectoryBasename}.xml`;
    const filePath = path.join(parentDirectory, fileName);

    if (rootResult !== undefined) {
      const [rootElementName, rootElementHeader] = rootResult;
      await buildReassembledFile(
        combinedXmlContents,
        filePath,
        rootElementName,
        rootElementHeader,
      );
      if (postPurge) await promises.rm(xmlPath, { recursive: true });
    } else {
      logger.error(
        `No files under ${xmlPath} were parsed successfully. A reassembled XML file was not created.`,
      );
    }
  }
}
