import * as fs from "node:fs/promises";
import * as path from "node:path";
import { logger } from "@src/index";
import { XMLParser } from "fast-xml-parser";
import { XML_PARSER_OPTION } from "@src/helpers/types";
import { buildReassembledFile } from "@src/service/buildReassembledFiles";
import { buildNestedElements } from "@src/service/buildNestedElements";

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

    const files = await fs.readdir(dirPath);

    // Sort files based on the name
    files.sort((fileA, fileB) => {
      const fullNameA = fileA.split(".")[0].toLowerCase();
      const fullNameB = fileB.split(".")[0].toLowerCase();
      return fullNameA.localeCompare(fullNameB);
    });

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const fileStat = await fs.stat(filePath);
      if (fileStat.isFile() && filePath.endsWith(".xml")) {
        const xmlContent = await fs.readFile(filePath, "utf-8");
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
        const combinedXmlString = buildNestedElements(xmlParsed, 0);
        combinedXmlContents.push(combinedXmlString);
      }
    }

    return [combinedXmlContents, rootResult];
  }

  async processFilesForRootElement(
    xmlParsed: Record<string, XmlElement>,
  ): Promise<[string, string | undefined]> {
    const rootElementName = Object.keys(xmlParsed)[1];
    const rootElement: XmlElement = xmlParsed[rootElementName];
    let rootElementHeader = `<${rootElementName}`;
    // Add any attributes prefixed with "@"
    for (const [attrKey, attrValue] of Object.entries(rootElement)) {
      if (attrKey.startsWith("@")) {
        logger.debug(attrKey);
        const cleanAttrKey = attrKey.slice(2); // Remove the "@" prefix
        rootElementHeader += ` ${cleanAttrKey}="${String(attrValue)}"`;
      }
    }
    rootElementHeader += ">";
    return [rootElementName, rootElementHeader];
  }

  async reassemble(xmlAttributes: {
    xmlPath: string;
    fileExtension?: string;
    postPurge?: boolean;
  }): Promise<void> {
    const { xmlPath, fileExtension, postPurge = false } = xmlAttributes;
    const combinedXmlContents: string[] = [];
    const fileStat = await fs.stat(xmlPath);

    if (!fileStat.isDirectory()) {
      logger.error(
        `The provided xmlPath ${xmlPath} to reassemble is not a directory.`,
      );
      return;
    }
    logger.debug(`Parsing directory to reassemble: ${xmlPath}`);
    // Process files directly inside the `xmlPath` directory
    const filesInxmlPath = await fs.readdir(xmlPath);

    // Sort files based on the name
    filesInxmlPath.sort((fileA, fileB) => {
      const fullNameA = fileA.split(".")[0].toLowerCase();
      const fullNameB = fileB.split(".")[0].toLowerCase();
      return fullNameA.localeCompare(fullNameB);
    });

    let rootResult: [string, string | undefined] | undefined = undefined;
    for (const file of filesInxmlPath) {
      const filePath = path.join(xmlPath, file);
      const fileStat = await fs.stat(filePath);
      if (fileStat.isFile() && filePath.endsWith(".xml")) {
        const xmlContent = await fs.readFile(filePath, "utf-8");
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
        rootResult = await this.processFilesForRootElement(xmlParsed);
        const combinedXmlString = buildNestedElements(xmlParsed, 0);
        combinedXmlContents.push(combinedXmlString);
      } else if (fileStat.isDirectory()) {
        const [subdirectoryContents, subdirectoryRootResult] =
          await this.processFilesInDirectory(filePath);
        combinedXmlContents.push(...subdirectoryContents); // Concatenate contents from subdirectories
        if (subdirectoryRootResult && !rootResult) {
          rootResult = subdirectoryRootResult;
        }
      }
    }

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
      if (postPurge) await fs.rm(xmlPath, { recursive: true });
    } else {
      logger.error(
        `No files under ${xmlPath} were parsed successfully. A reassembled XML file was not created.`,
      );
    }
  }
}
