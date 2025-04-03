"use strict";

import { writeFile } from "node:fs/promises";

import { logger } from "@src/index";
import { INDENT } from "@src/constants/constants";

export async function buildReassembledFile(
  combinedXmlContents: string[],
  reassembledPath: string,
  xmlElement: string,
  xmlRootElementHeader: string | undefined,
  xmlDeclarationStr: string,
): Promise<void> {
  // Combine XML contents into a single string
  let finalXmlContent = combinedXmlContents.join("\n");

  // Escape special characters in xmlDeclarationStr for regex
  const escapedXmlDeclaration = xmlDeclarationStr.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );

  // Remove duplicate XML declarations (entire lines)
  const xmlDeclarationLineRegex = new RegExp(
    `^\\s*${escapedXmlDeclaration}\\s*$`,
    "gm",
  );

  finalXmlContent = finalXmlContent.replace(xmlDeclarationLineRegex, "");

  // Remove duplicate root elements
  finalXmlContent = finalXmlContent.replace(
    new RegExp(`<${xmlElement}\\s*[^>]*>`, "g"),
    "",
  );
  finalXmlContent = finalXmlContent.replace(
    new RegExp(`</${xmlElement}>`, "g"),
    "",
  );

  // Remove extra indentation within CDATA sections
  finalXmlContent = finalXmlContent.replace(
    /<!\[CDATA\[\s*([\s\S]*?)\s*]]>/g,
    function (_, cdataContent) {
      const trimmedContent = cdataContent.trim();
      const lines = trimmedContent.split("\n");
      const indentedLines = lines.map(function (line: string) {
        return line.replace(/^\s*/, "");
      });
      return (
        "<![CDATA[\n" + INDENT + indentedLines.join("\n" + INDENT) + "\n]]>"
      );
    },
  );

  // Remove extra newlines
  finalXmlContent = finalXmlContent.replace(/(\n\s*){2,}/g, `\n${INDENT}`);

  const closeTag = `</${xmlElement}>`;

  await writeFile(
    reassembledPath,
    `${xmlDeclarationStr}\n${xmlRootElementHeader}${finalXmlContent}${closeTag}`,
  );
  logger.debug(`Created reassembled file: ${reassembledPath}`);
}
