import * as fs from "node:fs/promises";
import * as path from "node:path";
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
      if (fileStat.isFile()) {
        const xmlContent = await fs.readFile(filePath, "utf-8");
        combinedXmlContents.push(xmlContent);
      } else if (fileStat.isDirectory()) {
        const subdirectoryContents =
          await this.processFilesInDirectory(filePath);
        combinedXmlContents.push(...subdirectoryContents); // Concatenate contents from subdirectories
      }
    }

    return combinedXmlContents;
  }

  async reassemble(xmlAttributes: {
    xmlElement: string;
    xmlPath: string;
    xmlNamespace?: string | undefined;
    fileExtension?: string | undefined;
  }): Promise<void> {
    const { xmlElement, xmlPath, xmlNamespace, fileExtension } = xmlAttributes;
    const combinedXmlContents: string[] = [];

    // Process files directly inside the `xmlPath` directory
    const filesInxmlPath = await fs.readdir(xmlPath);
    for (const file of filesInxmlPath) {
      const filePath = path.join(xmlPath, file);
      const fileStat = await fs.stat(filePath);
      if (fileStat.isFile()) {
        const xmlContent = await fs.readFile(filePath, "utf-8");
        combinedXmlContents.push(xmlContent);
      } else if (fileStat.isDirectory()) {
        const subdirectoryContents =
          await this.processFilesInDirectory(filePath);
        combinedXmlContents.push(...subdirectoryContents); // Concatenate contents from subdirectories
      }
    }

    const parentDirectory = path.dirname(xmlPath); // Get the parent directory path
    const subdirectoryBasename = path.basename(xmlPath);
    const fileName = fileExtension
      ? `${subdirectoryBasename}.${fileExtension}`
      : `${subdirectoryBasename}.xml`;
    const filePath = path.join(parentDirectory, fileName);

    await buildReassembledFile(
      combinedXmlContents,
      filePath,
      xmlElement,
      xmlNamespace,
    );
  }
}
