import { parseXML, buildXMLString, XmlElement } from "../src/index";

describe("function/index tests", () => {
  it("should test parsing and building an XML with the exported functions.", async () => {
    const result = await parseXML(
      "fixtures/ignore/HR_Admin.permissionset-meta.xml",
    );
    expect(buildXMLString(result as XmlElement)).toBeTruthy();
  });
  it("should return undefined when the file cannot be read", async () => {
    const result = await parseXML("non-existent-file.xml");

    expect(result).toBeUndefined();
  });
});
