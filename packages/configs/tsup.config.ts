import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: {
    entry: {
      index: 'src/index.ts',
    },
  },
  tsconfig: 'tsconfig.build.json',
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  platform: 'node',
  target: 'node20',
})
