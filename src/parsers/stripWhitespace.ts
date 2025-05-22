function isEmptyTextNode(key: string, value: any): boolean {
  return key === "#text" && typeof value === "string" && value.trim() === "";
}

function cleanArray(arr: any[]): any[] {
  return arr
    .map(stripWhitespaceTextNodes)
    .filter(
      (entry) =>
        !(typeof entry === "object" && Object.keys(entry).length === 0),
    );
}

function cleanObject(obj: any): any {
  const result: any = {};
  for (const key in obj) {
    const value = obj[key];
    if (isEmptyTextNode(key, value)) continue;

    const cleaned = stripWhitespaceTextNodes(value);
    if (cleaned !== undefined) {
      result[key] = cleaned;
    }
  }
  return result;
}

export function stripWhitespaceTextNodes(node: any): any {
  if (Array.isArray(node)) {
    return cleanArray(node);
  } else if (typeof node === "object" && node !== null) {
    return cleanObject(node);
  } else {
    return node;
  }
}
