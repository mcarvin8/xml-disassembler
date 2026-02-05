"use strict";

import { resolve } from "node:path";
import { logger } from "@src/index";
import { callNativeDisassemble } from "@src/rustBindings";

export class DisassembleXMLFileHandler {
  async disassemble(xmlAttributes: {
    filePath: string;
    uniqueIdElements?: string;
    strategy?: string;
    prePurge?: boolean;
    postPurge?: boolean;
    ignorePath?: string;
    format?: string;
  }): Promise<void> {
    let {
      filePath,
      uniqueIdElements,
      strategy = "unique-id",
      prePurge = false,
      postPurge = false,
      ignorePath = ".xmldisassemblerignore",
      format = "xml",
    } = xmlAttributes;

    if (!["unique-id", "grouped-by-tag"].includes(strategy)) {
      logger.warn(
        `Unsupported strategy "${strategy}", defaulting to "unique-id".`,
      );
      strategy = "unique-id";
    }

    await callNativeDisassemble(
      resolve(filePath),
      uniqueIdElements,
      strategy,
      prePurge,
      postPurge,
      ignorePath,
      format,
    );
  }
}
