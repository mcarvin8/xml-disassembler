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

export type BuildDisassembledFileOptions = {
  content: XmlElement | XmlElement[];
  disassembledPath: string;
  outputFileName?: string;
  subdirectory?: string;
  wrapKey?: string;
  isGroupedArray?: boolean;
  rootElementName: string;
  rootAttributes: XmlElement;
  format: string;
  xmlDeclaration?: Record<string, string>;
  uniqueIdElements?: string;
};

export type UnifiedParseResult = {
  leafContent: XmlElement;
  leafCount: number;
  hasNestedElements: boolean;
  nestedGroups?: XmlElementArrayMap;
};

export type BuildDisassembledFilesOptions = {
  filePath: string;
  disassembledPath: string;
  baseName: string;
  postPurge: boolean;
  format: string;
  uniqueIdElements?: string;
  strategy: string;
};

export type LeafWriteParams = {
  leafCount: number;
  leafContent: XmlElement;
  strategy: string;
  keyOrder: string[];
  options: {
    disassembledPath: string;
    outputFileName: string;
    rootElementName: string;
    rootAttributes: Record<string, string>;
    xmlDeclaration?: Record<string, string>;
    format: string;
  };
};

export type XmlElementArrayMap = Record<string, XmlElement[]>;
export type XmlElementMap = Record<string, XmlElement>;
