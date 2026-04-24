import path from "path";

/**
 * Resolve the platform-specific directory that contains the native Rust addon.
 *
 * Exported from its own module (instead of `index.ts`) so it can be unit-tested
 * without being part of the public package API. The rollup ESM plugin replaces
 * the call site in `index.ts` at build time, so this function only executes
 * when the package is consumed as CJS or when tests import it directly.
 */
export function resolveNativeDir(
  baseDir: string,
  platform: string,
  arch: string,
): string {
  const isDist = path.basename(baseDir) === "dist";
  return isDist
    ? path.join(baseDir, "native", `${platform}-${arch}`)
    : path.join(baseDir, "..", "dist", "native", `${platform}-${arch}`);
}
