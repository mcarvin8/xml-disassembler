import * as fs from "node:fs/promises";
import * as path from "node:path";
import { logger } from "@src/index";
import { XMLParser } from "fast-xml-parser";
import { XmlElement, XML_PARSER_OPTION } from "@src/helpers/types";
import { buildReassembledFile } from "@src/service/buildReassembledFiles";
import { buildNestedElements } from "@src/service/buildNestedElements";

export class ReassembleXMLFileHandler {
  async processFilesInDirectory(
    dirPath: string,
  ): Promise<[string[], [string, string | undefined] | undefined]> {
    const combinedXmlContents: string[] = [];
    let rootResult: [string, string | undefined] | undefined = undefined;
    const xmlParser = new XMLParser(XML_PARSER_OPTION);

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
        const xmlParsed = xmlParser.parse(xmlContent) as Record<
          string,
          XmlElement
        >;
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
  ): Promise<[string, string | undefined] | undefined> {
    const rootElementName = Object.keys(xmlParsed)[1];
    const rootElement: XmlElement = xmlParsed[rootElementName];
    let rootElementNamespace: string | undefined;
    if (rootElement["@_xmlns"] !== undefined) {
      rootElementNamespace = String(rootElement["@_xmlns"]);
    } else {
      rootElementNamespace = undefined;
    }
    if (rootElementName !== undefined && rootElementName.length > 0) {
      return [rootElementName, rootElementNamespace];
    }
    // No root element name found in any files
    return undefined;
  }

  async reassemble(xmlAttributes: {
    xmlPath: string;
    fileExtension?: string;
  }): Promise<void> {
    const { xmlPath, fileExtension } = xmlAttributes;
    const combinedXmlContents: string[] = [];
    const fileStat = await fs.stat(xmlPath);
    const xmlParser = new XMLParser(XML_PARSER_OPTION);

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
        const xmlParsed = xmlParser.parse(xmlContent) as Record<
          string,
          XmlElement
        >;
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

    const parentDirectory = path.dirname(xmlPath); // Get the parent directory path
    const subdirectoryBasename = path.basename(xmlPath);
    const fileName = fileExtension
      ? `${subdirectoryBasename}.${fileExtension}`
      : `${subdirectoryBasename}.xml`;
    const filePath = path.join(parentDirectory, fileName);

    if (rootResult !== undefined) {
      const [rootElementName, rootElementNamespace] = rootResult;
      await buildReassembledFile(
        combinedXmlContents,
        filePath,
        rootElementName,
        rootElementNamespace,
      );
    } else {
      logger.error(
        `A Root Element Name was not found in any files under ${xmlPath}`,
      );
      return;
    }
  }
}
