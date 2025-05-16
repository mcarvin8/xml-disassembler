import { XmlElement } from "@src/types/types";

export function mergeXmlElements(elements: XmlElement[]): XmlElement {
  if (elements.length === 0) throw new Error("No elements to merge.");

  const first = elements[0];
  const rootKey = Object.keys(first).find((k) => k !== "?xml");

  if (!rootKey) {
    throw new Error("No root element found in the provided XML elements.");
  }

  const mergedContent: Record<string, any> = {};

  for (const element of elements) {
    const current = element[rootKey] as Record<string, any>;

    for (const [childKey, value] of Object.entries(current)) {
      if (Array.isArray(value)) {
        mergedContent[childKey] = mergedContent[childKey]
          ? mergedContent[childKey].concat(value)
          : [...value];
      } else if (typeof value === "object") {
        mergedContent[childKey] = mergedContent[childKey]
          ? ([] as any[]).concat(mergedContent[childKey], value)
          : [value];
      } else {
        if (!mergedContent.hasOwnProperty(childKey)) {
          mergedContent[childKey] = value;
        }
      }
    }
  }

  const declaration = first["?xml"];
  const finalMerged: XmlElement = declaration
    ? { "?xml": declaration, [rootKey]: mergedContent }
    : { [rootKey]: mergedContent };

  return finalMerged;
}
