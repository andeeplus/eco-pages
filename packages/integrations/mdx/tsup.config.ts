import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  splitting: false,
  sourcemap: true,
  outDir: 'dist',
  clean: true,
  dts: true,
});
