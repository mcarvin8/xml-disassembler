"use strict";

export type XmlElement = {
  [key: string]: string | XmlElement | string[] | XmlElement[];
};

export type XmlElementParams = {
  element: XmlElement;
  disassembledPath: string;
  uniqueIdElements?: string;
  rootElementName: string;
  rootAttributes: XmlElement;
  key: string;
  leafContent: XmlElement;
  leafCount: number;
  hasNestedElements: boolean;
  xmlDeclaration: Record<string, string>;
  format: string;
};
