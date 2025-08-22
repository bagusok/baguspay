import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  target: "es2019",
  outDir: "dist",
  treeshake: true,
  splitting: false, // single entry - keep simple
  external: [
    "react",
    "react-dom",
    /@radix-ui\/react-.+/, // treat all radix ui peer deps as external
  ],
  esbuildOptions(options) {
    // keep JSX as React 17+ automatic by default
    options.jsx = "automatic" as any;
  },
});
