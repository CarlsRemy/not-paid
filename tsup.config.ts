import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/not-paid.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  minify: true,
  outDir: 'dist',
  // Asegura que se genere .mjs para ESM
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs',
    };
  },
});
