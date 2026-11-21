import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 結合テストは test/ の下の *.integration-spec.ts
    include: ['test/**/*.integration-spec.ts'],
  },
});
