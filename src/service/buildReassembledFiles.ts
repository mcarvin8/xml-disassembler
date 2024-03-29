"use strict";

import * as fs from "node:fs/promises";
import { logger } from "@src/index";
import { XML_HEADER, INDENT } from "@src/helpers/constants";

export async function buildReassembledFile(
  combinedXmlContents: string[],
  filePath: string,
  xmlElement: string,
  xmlNamespace: string | undefined,
): Promise<void> {
  // Combine XML contents into a single string
  let finalXmlContent = combinedXmlContents.join("\n");

  // Remove duplicate XML declarations
  finalXmlContent = finalXmlContent.replace(
    /<\?xml version="1.0" encoding="UTF-8"\?>/g,
    "",
  );

  // Remove duplicate parent elements
  finalXmlContent = finalXmlContent.replace(
    new RegExp(
      `<${xmlElement}[^>]*${xmlNamespace ? `( xmlns="${xmlNamespace}")?` : ""}>`,
      "g",
    ),
    "",
  );
  finalXmlContent = finalXmlContent.replace(
    new RegExp(`</${xmlElement}>`, "g"),
    "",
  );

  // Remove extra indentation within CDATA sections
  finalXmlContent = finalXmlContent.replace(
    /<!\[CDATA\[\s*([\s\S]*?)\s*]]>/g,
    (match: string, cdataContent: string) => {
      const trimmedContent = cdataContent.trim();
      const lines = trimmedContent.split("\n");
      const indentedLines = lines.map((line) => line.replace(/^\s*/, ""));
      return `<![CDATA[\n${INDENT}${indentedLines.join(`\n${INDENT}`)}\n]]>`;
    },
  );

  // Remove extra newlines
  finalXmlContent = finalXmlContent.replace(/(\n\s*){2,}/g, `\n${INDENT}`);

  const openTag = xmlNamespace
    ? `<${xmlElement} xmlns="${xmlNamespace}">`
    : `<${xmlElement}>`;
  const closeTag = `</${xmlElement}>`;

  await fs.writeFile(
    filePath,
    `${XML_HEADER}\n${openTag}${finalXmlContent}${closeTag}`,
  );
  logger.debug(`Created reassembled file: ${filePath}`);
}
