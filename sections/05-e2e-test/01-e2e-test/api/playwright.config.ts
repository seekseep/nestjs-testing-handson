import { defineConfig, devices } from '@playwright/test';

// ふだんの npm start（3000 番）とぶつからないように、E2E テストでは 3100 番で動かす
const PORT = 3100;

export default defineConfig({
  testDir: './e2e',
  // CI では、test.only の消し忘れがあれば落とす
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // 結果を 1 行ずつ出し、HTML のレポートも作る（npx playwright show-report で開く）
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // テストの前に API を起動し、終わったら止める
  webServer: {
    command: 'npm run start',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    env: {
      PORT: String(PORT),
      // 決め打ちのトークン（alice-token など）を通す偽物の認証にする。テスト専用
      USE_FAKE_AUTH: 'true',
    },
  },
});
