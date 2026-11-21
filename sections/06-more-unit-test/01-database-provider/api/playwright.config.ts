import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // 結果を 1 行ずつ出し、HTML のレポートも作る（npx playwright show-report で開く）
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    // podman compose up で動かした画面
    baseURL: 'http://localhost:3000',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
