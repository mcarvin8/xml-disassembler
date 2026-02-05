import {
  setLogLevel,
  logger,
  DisassembleXMLFileHandler,
  ReassembleXMLFileHandler,
} from "../src/index";

setLogLevel("debug");

describe("function/index tests", () => {
  beforeEach(async () => {
    jest.spyOn(logger, "debug");
    jest.spyOn(logger, "error");
    jest.spyOn(logger, "warn");
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  it("should export DisassembleXMLFileHandler and ReassembleXMLFileHandler", () => {
    expect(DisassembleXMLFileHandler).toBeDefined();
    expect(ReassembleXMLFileHandler).toBeDefined();
  });

  it("should allow creating handler instances", () => {
    const disassembleHandler = new DisassembleXMLFileHandler();
    const reassembleHandler = new ReassembleXMLFileHandler();
    expect(disassembleHandler).toBeInstanceOf(DisassembleXMLFileHandler);
    expect(reassembleHandler).toBeInstanceOf(ReassembleXMLFileHandler);
  });
});
