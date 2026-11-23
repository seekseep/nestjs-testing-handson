import { expect, test } from '@playwright/test';

test('3 人の飲み会で A が 10,000 円を立て替えると、B と C から A への支払いが出る', async ({ page, request }) => {
  // データが空の状態から始める（前のデータが残っていたら、ここで落ちる）
  const res = await request.get('http://localhost:3001/members');
  expect(await res.json()).toEqual([]);

  await page.goto('/');
  const members = page.getByRole('list', { name: 'メンバー' }).getByRole('listitem');

  // E1・E2: メンバーを 3 人足す。1 人ずつ、一覧に出るのを待ってから次の人を足す
  for (const [i, name] of ['A', 'B', 'C'].entries()) {
    await page.getByLabel('名前').fill(name);
    await page.getByRole('button', { name: 'メンバーを足す' }).click();
    await expect(members).toHaveCount(i + 1);
  }
  await expect(members).toHaveText(['A', 'B', 'C']);

  // E3: A が 3 人分の 10,000 円を立て替える（対象の人は、はじめから全員に印が付いている）
  await page.getByLabel('払った人').selectOption({ label: 'A' });
  await page.getByLabel('金額').fill('10000');
  await page.getByLabel('メモ').fill('飲み会');
  await page.getByRole('button', { name: '立て替えを記録する' }).click();
  await expect(
    page.getByRole('list', { name: '立て替え' }).getByRole('listitem'),
  ).toHaveText(['A が 10,000 円（飲み会）: A・B・C']);

  // E4: 清算に、B と C から A への支払いが出る
  await expect(
    page.getByRole('list', { name: '清算' }).getByRole('listitem'),
  ).toHaveText(['B → A 3,333 円', 'C → A 3,333 円']);
});
