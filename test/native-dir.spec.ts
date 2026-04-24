import { strictEqual } from "assert";
import path from "path";
import { resolveNativeDir } from "../src/native-dir";

describe("resolveNativeDir", () => {
  it("resolves to <baseDir>/native/<platform>-<arch> when baseDir is the built dist folder", () => {
    const result = resolveNativeDir(
      path.join("some", "pkg", "dist"),
      "linux",
      "x64",
    );
    strictEqual(result, path.join("some", "pkg", "dist", "native", "linux-x64"));
  });

  it("resolves to ../dist/native/<platform>-<arch> when baseDir is the source folder (dev/test)", () => {
    const result = resolveNativeDir(
      path.join("some", "pkg", "src"),
      "darwin",
      "arm64",
    );
    strictEqual(
      result,
      path.join("some", "pkg", "src", "..", "dist", "native", "darwin-arm64"),
    );
  });

  it("uses the baseDir's basename to determine the branch (not the full path)", () => {
    const distResult = resolveNativeDir("/tmp/dist", "win32", "x64");
    const srcResult = resolveNativeDir("/tmp/src", "win32", "x64");
    strictEqual(distResult, path.join("/tmp/dist", "native", "win32-x64"));
    strictEqual(
      srcResult,
      path.join("/tmp/src", "..", "dist", "native", "win32-x64"),
    );
  });
});
