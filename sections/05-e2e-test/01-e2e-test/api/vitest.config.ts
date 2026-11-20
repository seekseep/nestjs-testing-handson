import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`. Requires Vite 8, which ships this option.
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    // e2e/ の Playwright のテスト（*.spec.ts）を拾わないように、src/ の下だけにする
    include: ['src/**/*.spec.ts'],
  },
});
