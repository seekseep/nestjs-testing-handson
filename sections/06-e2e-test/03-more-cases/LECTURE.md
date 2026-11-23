---
docs: true
title: E2E テストを仕上げる
---

# E2E テストを仕上げる

![06 章 E2E テストを仕上げる](./images/00-thumbnail.svg)

[E2E テストの設計](../01-design/LECTURE.md) の表の残り（E2〜E4）を足し、ユースケースを最後（清算が出るところ）まで確かめるテストにします。

| 番号 | 前の節 | この節 |
|---|---|---|
| E1 | A を足す | B・C と同じくり返しに入れる |
| E2 | なし | B・C を足し、一覧が 3 人になるのを確かめる |
| E3 | なし | 立て替えを記録し、立て替えの一覧を確かめる |
| E4 | なし | 清算の欄を確かめる |

ユースケースは、メンバーを足してから立て替えを記録し、清算を見る、という 1 本の流れです。後の操作は前の操作で入れたデータを使うので、テストを分けず、1 つのテストに順に書きます。テストの名前も、ユースケースに合わせて変えます。

## テストを足す

::diff{file="apps/ui/e2e/settlement.spec.ts"}

- E1・E2 … 1 人ずつ、`toHaveCount(i + 1)` で一覧に出るのを待ってから次の人を足します。待たずに続けると、画面を描き直している間に次の名前を入れてしまいます
- E3 … `selectOption({ label: 'A' })` で、選択欄から A を選びます。対象の人は、はじめから全員に印が付いています
- E4 … `getByRole('list', { name: '清算' })` は「清算」の見出しが付いたリストです。`toHaveText([...])` で、項目の文字を上から順に確かめます

## 動かす

ルート（`warikan/`）でデータを消して起動し直し、`apps/ui/` でテストを流します。

```bash
podman compose down --volumes
podman compose up -d --build --wait
```

```bash
npx playwright test
```

```text
Running 1 test using 1 worker

  ✓  1 [chromium] › e2e/settlement.spec.ts:3:1 › 3 人の飲み会で A が 10,000 円を立て替えると、B と C から A への支払いが出る (336ms)

  1 passed (663ms)
```

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [Playwright: Actions](https://playwright.dev/docs/input) … `fill()`・`click()`・`selectOption()`
- [Playwright: Assertions](https://playwright.dev/docs/test-assertions) … `toHaveCount()`・`toHaveText()`

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::
