import { mergeXmlElements } from "../../src/builders/mergeXmlElements";
import { XmlElement } from "../../src/types/types";

describe("mergeXmlElements", () => {
  it("should merge simple XML elements", () => {
    const elements: XmlElement[] = [
      { root: { field1: "value1" } },
      { root: { field2: "value2" } },
    ];

    const result = mergeXmlElements(elements);

    expect(result).toEqual({
      root: {
        field1: "value1",
        field2: "value2",
      },
    });
  });

  it("should return undefined for empty array", () => {
    const result = mergeXmlElements([]);
    expect(result).toBeUndefined();
  });

  it("should preserve XML declaration", () => {
    const elements: XmlElement[] = [
      {
        "?xml": { version: "1.0", encoding: "UTF-8" },
        root: { field1: "value1" },
      },
      {
        "?xml": { version: "1.0", encoding: "UTF-8" },
        root: { field2: "value2" },
      },
    ];

    const result = mergeXmlElements(elements);

    expect(result).toEqual({
      "?xml": { version: "1.0", encoding: "UTF-8" },
      root: {
        field1: "value1",
        field2: "value2",
      },
    });
  });

  it("should merge array values when target is not an array", () => {
    // This tests line 50 in mergeArrayValue: target[key] = [target[key], ...value]
    const elements: XmlElement[] = [
      { root: { items: "single-item" } }, // First element has a string
      { root: { items: ["item1", "item2"] } }, // Second element has an array
    ];

    const result = mergeXmlElements(elements);

    // Should convert single item to array and merge
    expect(result).toEqual({
      root: {
        items: ["single-item", "item1", "item2"],
      },
    });
  });

  it("should merge arrays when target already has an array", () => {
    // This tests line 48 in mergeArrayValue: target[key].push(...value)
    const elements: XmlElement[] = [
      { root: { items: ["item1", "item2"] } },
      { root: { items: ["item3", "item4"] } },
    ];

    const result = mergeXmlElements(elements);

    // Arrays are actually merged together (push behavior)
    expect(result).toEqual({
      root: {
        items: ["item1", "item2", "item3", "item4"],
      },
    });
  });

  it("should assign array when target key doesn't exist", () => {
    // This tests line 45 in mergeArrayValue: target[key] = value
    const elements: XmlElement[] = [
      { root: { field1: "value1" } },
      { root: { items: ["item1", "item2"] } }, // New array field
    ];

    const result = mergeXmlElements(elements);

    expect(result).toEqual({
      root: {
        field1: "value1",
        items: ["item1", "item2"],
      },
    });
  });

  it("should merge nested objects", () => {
    const elements: XmlElement[] = [
      { root: { nested: { field1: "value1" } } },
      { root: { nested: { field2: "value2" } } },
    ];

    const result = mergeXmlElements(elements);

    expect(result).toEqual({
      root: {
        nested: [{ field1: "value1" }, { field2: "value2" }],
      },
    });
  });

  it("should merge objects into existing arrays", () => {
    const elements: XmlElement[] = [
      { root: { items: [{ id: "1" }] } },
      { root: { items: { id: "2" } } }, // Object added to array
    ];

    const result = mergeXmlElements(elements);

    // Object gets added to the existing array
    expect(result).toEqual({
      root: {
        items: [{ id: "1" }, { id: "2" }],
      },
    });
  });

  it("should merge primitive values", () => {
    const elements: XmlElement[] = [
      { root: { field1: "value1", shared: "first" } },
      { root: { field2: "value2" } }, // shared field not present
    ];

    const result = mergeXmlElements(elements);

    expect(result).toEqual({
      root: {
        field1: "value1",
        field2: "value2",
        shared: "first", // Should keep first value
      },
    });
  });

  it("should handle complex nested structures", () => {
    const elements: XmlElement[] = [
      {
        root: {
          level1: {
            level2: {
              field: "value1",
            },
          },
        },
      },
      {
        root: {
          level1: {
            level2: {
              field: "value2",
            },
          },
        },
      },
    ];

    const result = mergeXmlElements(elements);

    expect(result).toBeDefined();
    expect(result?.root).toBeDefined();
  });

  it("should merge multiple elements with various types", () => {
    const elements: XmlElement[] = [
      { root: { str: "text", num: "42", bool: "true" } },
      { root: { arr: ["a", "b"], obj: { key: "value" } } },
      { root: { str2: "more text" } },
    ];

    const result = mergeXmlElements(elements);

    expect(result).toEqual({
      root: {
        str: "text",
        num: "42",
        bool: "true",
        arr: ["a", "b"],
        obj: { key: "value" },
        str2: "more text",
      },
    });
  });

  it("should handle array to array merging scenarios", () => {
    // Tests the scenario where we have existing array and merge another array
    const elements: XmlElement[] = [
      { root: { tags: ["tag1"] } },
      { root: { tags: ["tag2", "tag3"] } },
      { root: { tags: ["tag4"] } },
    ];

    const result = mergeXmlElements(elements);

    // Arrays are merged together
    expect(result).toEqual({
      root: {
        tags: ["tag1", "tag2", "tag3", "tag4"],
      },
    });
  });

  it("should handle non-array to array conversion", () => {
    // Specifically tests line 50: target[key] = [target[key], ...value]
    const elements: XmlElement[] = [
      { root: { item: { id: "1", name: "first" } } }, // Object first
      {
        root: {
          item: [
            { id: "2", name: "second" },
            { id: "3", name: "third" },
          ],
        },
      }, // Then array
    ];

    const result = mergeXmlElements(elements);

    // Should convert object to array element and merge
    expect(result).toEqual({
      root: {
        item: [
          { id: "1", name: "first" },
          { id: "2", name: "second" },
          { id: "3", name: "third" },
        ],
      },
    });
  });
});
