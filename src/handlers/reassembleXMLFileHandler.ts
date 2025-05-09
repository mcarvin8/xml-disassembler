"use strict";

import { readFile, readdir, stat, rm, writeFile } from "node:fs/promises";
import { join, dirname, basename } from "node:path/posix";
import { parse as parseYaml } from "yaml";
import { parse as parseJson5 } from "json5";
import { parse as parseToml } from "smol-toml";
import { parse as parseIni } from "ini";

import { logger } from "@src/index";
import { XmlElement } from "@src/types/types";
import { parseXML } from "@src/parsers/parseXML";
import { buildXMLString } from "@src/builders/buildXMLString";
import { buildXMLDeclaration } from "@src/builders/buildXmlDeclaration";
import { extractRootAttributes } from "@src/builders/extractRootAttributes";

export class ReassembleXMLFileHandler {
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

    const referenceFile = await this.findFirstContentFile(filePath);
    if (!referenceFile) {
      logger.error(`No suitable files found under ${filePath} to infer root structure.`);
      return;
    }

    const parsedReference = await this.parseToXmlObject(referenceFile);
    if (!parsedReference) {
      logger.error(`${referenceFile} could not be parsed. Confirm formatting and try again.`);
      return;
    }

    const rootKey = Object.keys(parsedReference)[0];
    const rootElement = parsedReference[rootKey] as XmlElement;
    const rootAttributes = extractRootAttributes(rootElement);
    const xmlDeclarationStr = buildXMLDeclaration(parsedReference);

    const mergedRoot: XmlElement = {};
    const files = await readdir(filePath);
    files.sort((a, b) => a.localeCompare(b));

    for (const file of files) {
      const fullPath = join(filePath, file);
      const fileStat = await stat(fullPath);

      if (fileStat.isDirectory()) continue;
      if (!/\.(xml|json|json5|ya?ml|toml|ini)$/.test(file)) continue;

      const parsed = await this.parseToXmlObject(fullPath);
      if (!parsed) continue;

      const childElement = parsed[rootKey] as XmlElement;
      const stripped = this.stripAttributes(childElement);
      this.mergeIntoRoot(mergedRoot, stripped);
    }

    const wrapped: XmlElement = {
      [rootKey]: {
        ...rootAttributes,
        ...mergedRoot
      }
    };

    const finalXml = `${xmlDeclarationStr}\n${buildXMLString(wrapped)}`;

    const parentDirectory = dirname(filePath);
    const subdirectoryBasename = basename(filePath);
    const fileName = fileExtension
      ? `${subdirectoryBasename}.${fileExtension}`
      : `${subdirectoryBasename}.xml`;
    const outputPath = join(parentDirectory, fileName);

    await writeFile(outputPath, finalXml);
    logger.debug(`Created reassembled file: ${outputPath}`);

    if (postPurge) {
      await rm(filePath, { recursive: true });
    }
  }

  private async findFirstContentFile(dirPath: string): Promise<string | null> {
    const files = await readdir(dirPath);
    for (const file of files) {
      const fullPath = join(dirPath, file);
      const stats = await stat(fullPath);
      if (stats.isFile() && /\.(xml|json|json5|ya?ml|toml|ini)$/.test(file)) {
        return fullPath;
      }
    }
    return null;
  }

  private async parseToXmlObject(filePath: string): Promise<Record<string, XmlElement> | undefined> {
    if (filePath.endsWith(".xml")) {
      const parsed = await parseXML(filePath);
      if (parsed && typeof parsed === "object" && "?xml" in parsed) {
        delete parsed["?xml"];
      }
      return parsed;
    }

    const content = await readFile(filePath, "utf-8");
    let parsed: any;

    if (filePath.endsWith(".yaml") || filePath.endsWith(".yml")) {
      parsed = parseYaml(content);
    } else if (filePath.endsWith(".json5")) {
      parsed = parseJson5(content);
    } else if (filePath.endsWith(".json")) {
      parsed = JSON.parse(content);
    } else if (filePath.endsWith(".toml")) {
      parsed = parseToml(content);
    } else if (filePath.endsWith(".ini")) {
      parsed = parseIni(content);
    }

    if (!parsed) return undefined;

    const baseName = basename(filePath).split(".")[0];
    const normalized = this.normalizeToXmlElement(parsed);
    return { [baseName]: normalized };
  }

  private normalizeToXmlElement(obj: any): XmlElement {
    if (obj == null || typeof obj !== "object") return {};

    const result: XmlElement = {};
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        const isAllObjects = value.every(v => typeof v === "object" && v !== null);
        const isAllPrimitives = value.every(v => typeof v !== "object");

        if (isAllObjects) {
          result[key] = value.map(v => this.normalizeToXmlElement(v)) as XmlElement[];
        } else if (isAllPrimitives) {
          result[key] = value.map(v => String(v)) as string[];
        } else {
          logger.warn(`Mixed-type array for key "${key}" — coercing to string[]`);
          result[key] = value.map(v => JSON.stringify(v)) as string[];
        }
      } else if (typeof value === "object" && value !== null) {
        result[key] = this.normalizeToXmlElement(value);
      } else {
        result[key] = String(value);
      }
    }
    return result;
  }

  private mergeIntoRoot(target: XmlElement, source: XmlElement): void {
    for (const key of Object.keys(source)) {
      const incoming = source[key];
      const existing = target[key];

      if (existing !== undefined) {
        const normalizedExisting = Array.isArray(existing) ? existing : [existing];
        const normalizedIncoming = Array.isArray(incoming) ? incoming : [incoming];

        target[key] = this.homogenizeArray(normalizedExisting, normalizedIncoming);
      } else {
        target[key] = incoming;
      }
    }
  }

  private homogenizeArray(
    left: (string | XmlElement)[],
    right: (string | XmlElement)[]
  ): string[] | XmlElement[] {
    const combined = [...left, ...right];

    const isAllString = combined.every(val => typeof val === "string");
    const isAllObject = combined.every(val => typeof val === "object" && val !== null && !Array.isArray(val));

    if (isAllString) return combined as string[];
    if (isAllObject) return combined as XmlElement[];

    logger.warn("Mixed value types detected during merge; coercing all to string.");
    return combined.map(v => typeof v === "string" ? v : JSON.stringify(v));
  }

  private stripAttributes(element: XmlElement): XmlElement {
    const clone = { ...element };
    for (const key of Object.keys(clone)) {
      if (key.startsWith("@_")) {
        delete clone[key];
      }
    }
    return clone;
  }
}
