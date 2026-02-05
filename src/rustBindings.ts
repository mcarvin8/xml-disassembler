"use strict";

/**
 * Loads the xml-diassemble Neon addon. The native module is required;
 * the package will fail to load if it is not built.
 */

const nativeModule = require("xml-diassemble") as {
  disassemble: (
    filePath: string,
    uniqueIdElements?: string | null,
    strategy?: string | null,
    prePurge?: boolean,
    postPurge?: boolean,
    ignorePath?: string | null,
    format?: string | null,
  ) => void;
  reassemble: (
    filePath: string,
    fileExtension?: string | null,
    postPurge?: boolean,
  ) => void;
};

export function callNativeDisassemble(
  filePath: string,
  uniqueIdElements?: string,
  strategy?: string,
  prePurge?: boolean,
  postPurge?: boolean,
  ignorePath?: string,
  format?: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      nativeModule.disassemble(
        filePath,
        uniqueIdElements ?? null,
        strategy ?? null,
        prePurge ?? false,
        postPurge ?? false,
        ignorePath ?? null,
        format ?? null,
      );
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export function callNativeReassemble(
  filePath: string,
  fileExtension?: string,
  postPurge?: boolean,
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      nativeModule.reassemble(
        filePath,
        fileExtension ?? null,
        postPurge ?? false,
      );
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}
