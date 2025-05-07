export function stripWhitespaceTextNodes(node: any): any {
  if (Array.isArray(node)) {
    return node.map(stripWhitespaceTextNodes).filter((entry) => {
      // Remove empty objects after recursion
      return !(typeof entry === "object" && Object.keys(entry).length === 0);
    });
  } else if (typeof node === "object" && node !== null) {
    const result: any = {};
    for (const key in node) {
      const value = node[key];
      if (key === "#text" && typeof value === "string" && value.trim() === "") {
        continue;
      }
      const cleaned = stripWhitespaceTextNodes(value);
      if (cleaned !== undefined) {
        result[key] = cleaned;
      }
    }
    return result;
  } else {
    return node;
  }
}
