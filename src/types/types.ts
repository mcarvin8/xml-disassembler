"use strict";

export type XmlElement = {
  [key: string]: string | XmlElement | string[] | XmlElement[];
};

export type XmlElementParams = {
  element: XmlElement;
  disassembledPath: string;
  rootElementName: string;
  rootElementHeader: string;
  key: string;
  indent: string;
  leafContent: string;
  leafCount: number;
  hasNestedElements: boolean;
  xmlDeclarationStr: string;
  format: string;
};
