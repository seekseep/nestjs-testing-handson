import { expect, test } from '@playwright/test';

// 画面は sessionStorage の token を API に送る。
// 画面のスクリプトが動く前に、決め打ちのトークンを入れておく。
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('token', 'alice-token');
  });
});

/** ほかのテストのメモと混ざらないように、テストごとに違うタイトルにする。 */
function uniqueTitle(label: string): string {
  return `${label} ${Date.now()}`;
}

test('メモを追加すると一覧に出て、読み込み直しても残っている', async ({
  page,
}) => {
  const title = uniqueTitle('買い物');
  await page.goto('/');

  await page.getByPlaceholder('タイトル').fill(title);
  await page.getByPlaceholder('本文').fill('牛乳');
  await page.getByRole('button', { name: '追加' }).click();

  const item = page.getByRole('listitem').filter({ hasText: title });
  await expect(item).toBeVisible();
  await expect(item).toContainText('牛乳');

  // 読み込み直しても、API に保存されているので残っている
  await page.reload();
  await expect(item).toBeVisible();
});

test('削除すると一覧から消える', async ({ page }) => {
  const title = uniqueTitle('消すメモ');
  await page.goto('/');
  await page.getByPlaceholder('タイトル').fill(title);
  await page.getByRole('button', { name: '追加' }).click();

  const item = page.getByRole('listitem').filter({ hasText: title });
  await item.getByRole('button', { name: '削除' }).click();
  await expect(item).toHaveCount(0);
});

test('タイトルが空だと、API の入力チェックのエラーが出る', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '追加' }).click();

  await expect(page.getByRole('alert')).toContainText('title: Too small');
});
