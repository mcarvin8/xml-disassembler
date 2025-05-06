export function stripWhitespaceTextNodes(node: any): any {
  if (Array.isArray(node)) {
    return node
      .map(stripWhitespaceTextNodes)
      .filter(
        (entry) =>
          !(
            entry &&
            entry["#text"] !== undefined &&
            entry["#text"].trim() === ""
          ),
      );
  } else if (typeof node === "object" && node !== null) {
    const result: any = {};
    for (const key in node) {
      const value = node[key];
      if (key === "#text" && typeof value === "string" && value.trim() === "") {
        continue;
      }
      result[key] = stripWhitespaceTextNodes(value);
    }
    return result;
  } else {
    return node;
  }
}
