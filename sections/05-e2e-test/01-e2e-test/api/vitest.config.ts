import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 単体テストは src/ の下の *.spec.ts
    include: ['src/**/*.spec.ts'],
  },
});
