"use strict";

import { XmlElement } from "@src/helpers/types";
import { buildNestedFile } from "@src/service/buildNestedFiles";

export async function processElement(
  element: XmlElement,
  metadataPath: string,
  uniqueIdElements: string | undefined,
  rootElementName: string,
  rootElementHeader: string,
  key: string,
  indent: string,
  leafContent: string,
  leafCount: number,
  hasNestedElements: boolean,
): Promise<[string, number, boolean]> {
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
    hasNestedElements = true;
  } else {
    const fieldValue = element;
    leafContent += `${indent}<${key}>${String(fieldValue)}</${key}>\n`;
    leafCount++;
  }
  return [leafContent, leafCount, hasNestedElements];
}
