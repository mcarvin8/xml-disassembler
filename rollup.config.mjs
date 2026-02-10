import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

/** For ESM builds: replace require() of .node with createRequire(import.meta.url) */
function esmNativeLoader() {
  return {
    name: "esm-native-loader",
    renderChunk(code, chunk, options) {
      if (options.format !== "es") return null;
      const requireLine =
        /const\s+nativeAddon\s*=\s*require\s*\(\s*path\.join\s*\(\s*__dirname\s*,\s*["']\.\.["']\s*,\s*["']dist["']\s*,\s*["']native["']\s*,\s*["']index\.node["']\s*\)\s*\)\s*;?/;
      if (!requireLine.test(code)) return null;
      const newCode = code
        .replace(
          /import path from ['"]path['"]\s*;?/,
          "import path from 'path';\nimport { createRequire } from 'module';\nimport { fileURLToPath } from 'url';",
        )
        .replace(
          requireLine,
          "const __dirname = path.dirname(fileURLToPath(import.meta.url));\nconst nativeAddon = createRequire(import.meta.url)(path.join(__dirname, 'native', 'index.node'));",
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
