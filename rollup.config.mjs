import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default {
  input: "./src/index.ts",
  external: (id) => id.includes("native-loader.cjs"),
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
  ],
  plugins: [
    typescript({
      tsconfig: "tsconfig.json",
      declaration: true,
      outDir: "./dist",
      declarationDir: "./dist/typings",
    }),
  ],
};
