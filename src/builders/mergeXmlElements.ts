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
    const current = element[rootKey] as Record<string, any>;

    for (const [childKey, value] of Object.entries(current)) {
      if (Array.isArray(value)) {
        mergedContent[childKey] = [...value];
      } else if (typeof value === "object") {
        if (Array.isArray(mergedContent[childKey])) {
          mergedContent[childKey].push(value);
        } else if (mergedContent[childKey]) {
          mergedContent[childKey] = [mergedContent[childKey], value];
        } else {
          mergedContent[childKey] = value;
        }
      } else {
        if (!mergedContent.hasOwnProperty(childKey)) {
          mergedContent[childKey] = value;
        }
      }
    }
  }

  const declaration = first["?xml"];
  const finalMerged: XmlElement = {
    "?xml": declaration,
    [rootKey]: mergedContent,
  };
  return finalMerged;
}
