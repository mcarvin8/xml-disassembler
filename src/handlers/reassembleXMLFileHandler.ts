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

    const files = (await readdir(filePath)).sort();
    if (files.length === 0) {
      logger.error(`No files found in directory: ${filePath}`);
      return;
    }

    const primaryFilePath = join(filePath, files[0]);
    const primaryParsed = await this.parseToXmlObject(primaryFilePath);
    if (!primaryParsed) {
      logger.error(`${primaryFilePath} could not be parsed. Confirm formatting and try again.`);
      return;
    }

    const rootKey = Object.keys(primaryParsed)[0];
    const xmlDeclarationStr = buildXMLDeclaration(primaryParsed);
    const rootAttributes = extractRootAttributes(primaryParsed[rootKey]);

    const parsedElements: XmlElement[] = [];
    for (const file of files) {
      const filePath = join(fileAttributes.filePath, file);
      const stats = await stat(filePath);

      if (stats.isDirectory()) continue;
      if (!/\.(xml|json|json5|ya?ml|toml|ini)$/.test(file)) continue;

      const parsed = await this.parseToXmlObject(filePath);
      if (!parsed || !parsed[rootKey]) continue;

      const stripped = this.stripAttributes(parsed[rootKey]);
      parsedElements.push(stripped);
    }

    if (parsedElements.length === 0) {
      logger.error(`No valid files parsed under ${filePath}`);
      return;
    }

    const mergedRoot: XmlElement = {};
    for (const el of parsedElements) {
      this.mergeIntoRoot(mergedRoot, el);
    }

    const wrapped: XmlElement = {
      [rootKey]: {
        ...rootAttributes,
        ...mergedRoot
      }
    };

    const finalXml = `${xmlDeclarationStr}\n${buildXMLString(wrapped)}`;
    const outputName = fileExtension ? `${basename(filePath)}.${fileExtension}` : `${basename(filePath)}.xml`;
    const outputPath = join(dirname(filePath), outputName);

    await writeFile(outputPath, finalXml);
    logger.debug(`Created reassembled file: ${outputPath}`);

    if (postPurge) await rm(filePath, { recursive: true });
  }

  private async parseToXmlObject(filePath: string): Promise<Record<string, XmlElement> | undefined> {
    if (filePath.endsWith(".xml")) {
      const parsed = await parseXML(filePath);
      if (parsed && parsed["?xml"]) delete parsed["?xml"];
      return parsed;
    }

    const content = await readFile(filePath, "utf-8");
    let parsed: any;

    if (filePath.endsWith(".yaml") || filePath.endsWith(".yml")) parsed = parseYaml(content);
    else if (filePath.endsWith(".json5")) parsed = parseJson5(content);
    else if (filePath.endsWith(".json")) parsed = JSON.parse(content);
    else if (filePath.endsWith(".toml")) parsed = parseToml(content);
    else if (filePath.endsWith(".ini")) parsed = parseIni(content);

    return parsed ? this.wrapAsXml(parsed, filePath) : undefined;
  }

  private wrapAsXml(obj: any, filePath: string): Record<string, XmlElement> {
    const baseName = basename(filePath).split(".")[0];
    const normalized = this.normalizeToXmlElement(obj);
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
      if (key.startsWith("@_")) delete clone[key];
    }
    return clone;
  }
}