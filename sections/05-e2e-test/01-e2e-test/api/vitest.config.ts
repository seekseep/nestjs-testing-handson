import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    // e2e/ の Playwright のテスト（*.spec.ts）を拾わないように、src/ の下だけにする
    include: ['src/**/*.spec.ts'],
  },
});
