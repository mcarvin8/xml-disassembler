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
  format: string;
  xmlDeclaration?: Record<string, string>;
};

export type XmlElementArrayMap = Record<string, XmlElement[]>;
export type XmlElementMap = Record<string, XmlElement>;
