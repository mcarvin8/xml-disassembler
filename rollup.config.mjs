import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

/** For ESM builds: replace require() of .node with createRequire(import.meta.url) and platform path */
function esmNativeLoader() {
  return {
    name: "esm-native-loader",
    renderChunk(code, chunk, options) {
      if (options.format !== "es") return null;
      // Match: const isDist = ... const nativeDir = ... const nativeAddon = require(path.join(nativeDir, "index.node"));
      const block =
        /const\s+isDist\s*=[\s\S]*?const\s+nativeAddon\s*=\s*require\s*\(\s*path\.join\s*\(\s*nativeDir\s*,\s*["']index\.node["']\s*\)\s*\)\s*;?/;
      if (!block.test(code)) return null;
      const newCode = code
        .replace(
          /import path from ['"]path['"]\s*;?/,
          "import path from 'path';\nimport { createRequire } from 'module';\nimport { fileURLToPath } from 'url';",
        )
        .replace(
          block,
          "const __dirname = path.dirname(fileURLToPath(import.meta.url));\nconst nativeDir = path.join(__dirname, 'native', process.platform + '-' + process.arch);\nconst nativeAddon = createRequire(import.meta.url)(path.join(nativeDir, 'index.node'));",
        );
      return { code: newCode, map: null };
    },
  };
}

export default {
  input: "./src/index.ts",
  output: [
    {
      file: "./dist/index.mjs",
      format: "es",
      sourcemap: true,
    },
    {
      file: "./dist/index.cjs",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "./dist/index.umd.js",
      format: "umd",
      name: "jsTemplate",
      globals: {},
      sourcemap: true,
    },
    ,
    {
      file: "./dist/index.min.mjs",
      format: "es",
      sourcemap: true,
      plugins: [terser()],
    },
    {
      file: "./dist/index.min.cjs",
      format: "cjs",
      sourcemap: true,
      plugins: [terser()],
    },
    {
      file: "./dist/index.min.umd.js",
      format: "umd",
      name: "jsTemplate",
      globals: {},
      sourcemap: true,
      plugins: [terser()],
    },
  ],
  plugins: [
    typescript({
      tsconfig: "tsconfig.json",
      declaration: true,
      outDir: "./dist",
      declarationDir: "./dist/typings",
    }),
    esmNativeLoader(),
  ],
};
