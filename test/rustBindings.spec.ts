const mockDisassemble = jest.fn();
const mockReassemble = jest.fn();

jest.mock("xml-diassemble", () => ({
  disassemble: (...args: unknown[]) => mockDisassemble(...args),
  reassemble: (...args: unknown[]) => mockReassemble(...args),
}));

import {
  callNativeDisassemble,
  callNativeReassemble,
} from "../src/rustBindings";

describe("rustBindings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("callNativeDisassemble", () => {
    it("should resolve when native disassemble succeeds", async () => {
      mockDisassemble.mockImplementation(() => {});

      await expect(
        callNativeDisassemble("/path/to/file.xml"),
      ).resolves.toBeUndefined();

      expect(mockDisassemble).toHaveBeenCalledWith(
        "/path/to/file.xml",
        null,
        null,
        false,
        false,
        null,
        null,
      );
    });

    it("should pass optional params to native disassemble", async () => {
      mockDisassemble.mockImplementation(() => {});

      await callNativeDisassemble(
        "/path/to/file.xml",
        "id",
        "hash",
        true,
        true,
        ".ignore",
        "json",
      );

      expect(mockDisassemble).toHaveBeenCalledWith(
        "/path/to/file.xml",
        "id",
        "hash",
        true,
        true,
        ".ignore",
        "json",
      );
    });

    it("should reject when native disassemble throws", async () => {
      const error = new Error("Native disassemble failed");
      mockDisassemble.mockImplementation(() => {
        throw error;
      });

      await expect(callNativeDisassemble("/path/to/file.xml")).rejects.toThrow(
        "Native disassemble failed",
      );
    });
  });

  describe("callNativeReassemble", () => {
    it("should resolve when native reassemble succeeds", async () => {
      mockReassemble.mockImplementation(() => {});

      await expect(
        callNativeReassemble("/path/to/file"),
      ).resolves.toBeUndefined();

      expect(mockReassemble).toHaveBeenCalledWith("/path/to/file", null, false);
    });

    it("should reject when native reassemble throws", async () => {
      const error = new Error("Native reassemble failed");
      mockReassemble.mockImplementation(() => {
        throw error;
      });

      await expect(callNativeReassemble("/path/to/file")).rejects.toThrow(
        "Native reassemble failed",
      );
    });
  });
});
