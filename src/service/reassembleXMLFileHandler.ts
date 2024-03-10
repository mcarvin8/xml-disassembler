import * as fs from "node:fs/promises";
import * as path from "node:path";
import { logger } from "@src/index";
import { XMLParser } from "fast-xml-parser";
import { XmlElement, XML_PARSER_OPTION } from "@src/helpers/types";
import { buildReassembledFile } from "@src/service/buildReassembledFiles";

export class ReassembleXMLFileHandler {
  async processFilesInDirectory(dirPath: string): Promise<string[]> {
    const combinedXmlContents: string[] = [];
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
        combinedXmlContents.push(xmlContent);
      }
    }

    return combinedXmlContents;
  }

  async processFilesForRootElement(
    dirPath: string,
  ): Promise<[string, string | undefined] | undefined> {
    const files = await fs.readdir(dirPath);
    const xmlParser = new XMLParser(XML_PARSER_OPTION);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const fileStat = await fs.stat(filePath);

      if (fileStat.isDirectory()) {
        // Recursively process files in subdirectory
        const result = await this.processFilesForRootElement(filePath);
        if (result !== undefined) {
          // Found root element name, return it
          return result;
        }
      } else if (fileStat.isFile() && filePath.endsWith(".xml")) {
        // Process files
        const xmlContent = await fs.readFile(filePath, "utf-8");
        const xmlParsed = xmlParser.parse(xmlContent) as Record<
          string,
          XmlElement
        >;
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
      }
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

    if (!fileStat.isDirectory()) {
      logger.error(`The provided xmlPath ${xmlPath} is not a directory.`);
      return;
    }
    // Process files directly inside the `xmlPath` directory
    const filesInxmlPath = await fs.readdir(xmlPath);

    // Sort files based on the name
    filesInxmlPath.sort((fileA, fileB) => {
      const fullNameA = fileA.split(".")[0].toLowerCase();
      const fullNameB = fileB.split(".")[0].toLowerCase();
      return fullNameA.localeCompare(fullNameB);
    });

    for (const file of filesInxmlPath) {
      const filePath = path.join(xmlPath, file);
      const fileStat = await fs.stat(filePath);
      if (fileStat.isFile() && filePath.endsWith(".xml")) {
        const xmlContent = await fs.readFile(filePath, "utf-8");
        combinedXmlContents.push(xmlContent);
      } else if (fileStat.isDirectory()) {
        const subdirectoryContents =
          await this.processFilesInDirectory(filePath);
        combinedXmlContents.push(...subdirectoryContents); // Concatenate contents from subdirectories
      }
    }

    // Process at least one XML file to get the `rootElementName` and `rootElementNamespace`
    const rootResult = await this.processFilesForRootElement(xmlPath);

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
