import { XmlElement } from "@src/types/types";
import { logger } from "@src/index";

export function mergeXmlElements(
  elements: XmlElement[],
): XmlElement | undefined {
  if (elements.length === 0) {
    logger.error("No elements to merge.");
    return;
  }

  const first = elements[0];
  const rootKey = Object.keys(first).find((k) => k !== "?xml")!;
  const mergedContent: Record<string, any> = {};

  for (const element of elements) {
    mergeElementContent(mergedContent, element[rootKey] as Record<string, any>);
  }

  return buildFinalXmlElement(first["?xml"], rootKey, mergedContent);
}

function mergeElementContent(
  target: Record<string, any>,
  source: Record<string, any>,
) {
  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value)) {
      mergeArrayValue(target, key, value);
    } else if (isMergeableObject(value)) {
      mergeObjectValue(target, key, value);
    } else {
      mergePrimitiveValue(target, key, value);
    }
  }
}

function mergeArrayValue(
  target: Record<string, any>,
  key: string,
  value: any[],
) {
  target[key] = [...value];
}

function mergeObjectValue(
  target: Record<string, any>,
  key: string,
  value: Record<string, any>,
) {
  if (Array.isArray(target[key])) {
    target[key].push(value);
  } else if (target[key]) {
    target[key] = [target[key], value];
  } else {
    target[key] = value;
  }
}

function mergePrimitiveValue(
  target: Record<string, any>,
  key: string,
  value: any,
) {
  if (!Object.prototype.hasOwnProperty.call(target, key)) {
    target[key] = value;
  }
}

function isMergeableObject(value: any): value is Record<string, any> {
  return typeof value === "object" && value !== null;
}

function buildFinalXmlElement(
  declaration: any,
  rootKey: string,
  content: Record<string, any>,
): XmlElement {
  return declaration
    ? { "?xml": declaration, [rootKey]: content }
    : { [rootKey]: content };
}
