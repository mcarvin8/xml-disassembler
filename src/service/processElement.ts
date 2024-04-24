"use strict";

import { buildNestedFile } from "@src/service/buildNestedFiles";
import { ProcessElementParams } from "@src/helpers/types";

export async function processElement(
  params: ProcessElementParams,
): Promise<[string, number, boolean]> {
  const {
    element,
    metadataPath,
    uniqueIdElements,
    rootElementName,
    rootElementHeader,
    key,
    indent,
    leafContent,
    leafCount,
    hasNestedElements,
  } = params;

  if (typeof element === "object") {
    await buildNestedFile(
      element,
      metadataPath,
      uniqueIdElements,
      rootElementName,
      rootElementHeader,
      key,
      indent,
    );
    return [leafContent, leafCount, true];
  } else {
    const updatedLeafContent = `${leafContent}${indent}<${key}>${String(element)}</${key}>\n`;
    return [updatedLeafContent, leafCount + 1, hasNestedElements];
  }
}
