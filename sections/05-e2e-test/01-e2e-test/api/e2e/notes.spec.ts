import { expect, test } from '@playwright/test';

// API を呼ぶときに付ける、決め打ちのトークン
const asAlice = { Authorization: 'Bearer alice-token' };

/** ほかのテストのノートと混ざらないように、テストごとに違う文にする。 */
function uniqueText(label: string): string {
  return `${label} ${Date.now()}`;
}

test('API で作ったノートが、一覧の画面に出る', async ({ page, request }) => {
  const text = uniqueText('牛乳を買う');
  const res = await request.post('/notes', { headers: asAlice, data: { text } });
  expect(res.status()).toBe(201);

  await page.goto('/notes.html');

  await expect(page.getByRole('listitem').filter({ hasText: text })).toBeVisible();
});

test('API で消したノートは、一覧の画面から消える', async ({ page, request }) => {
  const text = uniqueText('消すノート');
  const res = await request.post('/notes', { headers: asAlice, data: { text } });
  const { id } = (await res.json()) as { id: string };
  await page.goto('/notes.html');
  const item = page.getByRole('listitem').filter({ hasText: text });
  await expect(item).toBeVisible();

  await request.delete(`/notes/${id}`, { headers: asAlice });
  await page.reload();

  await expect(item).toHaveCount(0);
});
