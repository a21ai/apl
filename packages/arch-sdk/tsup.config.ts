import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/serde/instruction.ts', 'src/serde/account.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  esbuildOptions(options) {
    options.conditions = ['import', 'module'];
  },
});
