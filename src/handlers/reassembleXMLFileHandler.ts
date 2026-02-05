"use strict";

import { resolve } from "node:path";
import { callNativeReassemble } from "@src/rustBindings";

export class ReassembleXMLFileHandler {
  async reassemble(xmlAttributes: {
    filePath: string;
    fileExtension?: string;
    postPurge?: boolean;
  }): Promise<void> {
    const { filePath, fileExtension, postPurge = false } = xmlAttributes;

    await callNativeReassemble(resolve(filePath), fileExtension, postPurge);
  }
}
