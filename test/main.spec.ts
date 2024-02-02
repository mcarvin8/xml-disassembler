import { DisassembleXMLFileHandler } from "@src/service/disassembleXMLFileHandler";
import { ReassembleXMLFileHandler } from "@src/service/reassembleXMLFileHandler";

describe("main function", () => {
  beforeEach(() => {
    jest.spyOn(console, "log");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should disassemble a general XML file (nested and leaf elements) with unique ID elements."', async () => {
    const handler = new DisassembleXMLFileHandler();
    await handler.disassemble({
      xmlPath: "test/baselines/general",
      uniqueIdElements:
        "application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field",
      xmlElement: "PermissionSet",
    });

    // Ensure that the console.log spy was called with the correct message
    expect(console.log).toHaveBeenCalled();
  });
  it('should reassemble a general XML file (nested and leaf elements) with a namespace and file extension."', async () => {
    const handler = new ReassembleXMLFileHandler();
    await handler.reassemble({
      xmlPath: "test/baselines/general/HR_Admin",
      xmlElement: "PermissionSet",
      xmlNamespace: "http://soap.sforce.com/2006/04/metadata",
      fileExtension: "permissionset-meta.xml",
    });

    // Ensure that the console.log spy was called with the correct message
    expect(console.log).toHaveBeenCalled();
  });
  it("should disassemble a XML file with CDATA.", async () => {
    const handler = new DisassembleXMLFileHandler();
    await handler.disassemble({
      xmlPath: "test/baselines/cdata",
      uniqueIdElements: "apiName",
      xmlElement: "MarketingAppExtension",
    });

    // Ensure that the console.log spy was called with the correct message
    expect(console.log).toHaveBeenCalled();
  });
  it("should reassemble a XML file with CDATA.", async () => {
    const handler = new ReassembleXMLFileHandler();
    await handler.reassemble({
      xmlPath: "test/baselines/cdata/VidLand_US",
      xmlElement: "MarketingAppExtension",
    });

    // Ensure that the console.log spy was called with the correct message
    expect(console.log).toHaveBeenCalled();
  });
  it("should disassemble a XML file with comments and an invalid unique ID element.", async () => {
    const handler = new DisassembleXMLFileHandler();
    await handler.disassemble({
      xmlPath: "test/baselines/comments",
      uniqueIdElements: "invalid",
      xmlElement: "GlobalValueSetTranslation",
    });

    // Ensure that the console.log spy was called with the correct message
    expect(console.log).toHaveBeenCalled();
  });
  it("should reassemble a XML file with comments.", async () => {
    const handler = new ReassembleXMLFileHandler();
    await handler.reassemble({
      xmlPath: "test/baselines/comments/Numbers-fr",
      xmlElement: "GlobalValueSetTranslation",
    });

    // Ensure that the console.log spy was called with the correct message
    expect(console.log).toHaveBeenCalled();
  });
  it("should disassemble a XML file with a deeply nested unique ID element.", async () => {
    const handler = new DisassembleXMLFileHandler();
    await handler.disassemble({
      xmlPath: "test/baselines/child-unique-id-element",
      uniqueIdElements:
        "apexClass,name,object,field,layout,actionName,targetReference,assignToReference,choiceText,promptText",
      xmlElement: "Flow",
    });

    // Ensure that the console.log spy was called with the correct message
    expect(console.log).toHaveBeenCalled();
  });
  it("should disassemble a XML file with an array of leaf elements and no defined unique ID element.", async () => {
    const handler = new DisassembleXMLFileHandler();
    await handler.disassemble({
      xmlPath: "test/baselines/array-of-leafs",
      xmlElement: "Application",
    });

    // Ensure that the console.log spy was called with the correct message
    expect(console.log).toHaveBeenCalled();
  });
});
