import { expect, test } from '@playwright/test';

test('メンバーを足すと、一覧に出る', async ({ page, request }) => {
  // データが空の状態から始める（前のデータが残っていたら、ここで落ちる）
  const res = await request.get('http://localhost:3001/members');
  expect(await res.json()).toEqual([]);

  await page.goto('/');
  const members = page.getByRole('list', { name: 'メンバー' }).getByRole('listitem');

  // E1
  await page.getByLabel('名前').fill('A');
  await page.getByRole('button', { name: 'メンバーを足す' }).click();

  // 一覧が 1 人になるまで待ってから、中身を確かめる
  await expect(members).toHaveCount(1);
  await expect(members).toHaveText(['A']);
});
