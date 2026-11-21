---
docs: true
title: E2E テスト
---

# E2E テスト

![05 章 E2E テスト](./images/00-thumbnail.svg)

ブラウザで画面を操作し、画面から DB までをまとめて確かめる **E2E テスト** を書きます。テストの相手は、Podman で動かした画面と API です。確かめるのは、次のユースケースです。

> 3 人の飲み会で A が 10,000 円を立て替えた。画面でメンバーと立て替えを入れると、清算の欄に B・C から A への支払いが出る。

## Playwright を入れる

ブラウザを操作する道具には **Playwright** を使います。Playwright と、テストで使うブラウザ（Chromium）を入れます。

```bash
npm install -D @playwright/test
npx playwright install chromium
```

Linux（Ubuntu など）で、テストの起動時にブラウザの部品が足りないというエラーが出たら、`npx playwright install-deps chromium` で入れます（`sudo` のパスワードを聞かれます）。

テストを置く場所（`e2e/`）と、開く画面（`http://localhost:3000`）を設定します。

::diff{file="api/playwright.config.ts"}

`npm run test:e2e` で動くようにし、Playwright が作る結果とレポートを Git に入れないようにします。

::diff{file="api/package.json" base="generated"}

::diff{file="api/.gitignore"}

## E2E テストを書く

::diff{file="api/e2e/settlement.spec.ts"}

- `page.goto('/')` … `baseURL`（`http://localhost:3000`）の画面を開きます
- `page.getByLabel('名前')`・`page.getByRole('button', { name: 'メンバーを足す' })` … 画面に出ている文字（ラベル・ボタンの名前）で、操作するところを選びます
- `toHaveCount()`・`toHaveText()` … 期待どおりになるまで待ってから確かめます。API の応答を待つための `sleep` は要りません。メンバーは 1 人ずつ、一覧に出るのを待ってから次の人を足します
- `getByRole('list', { name: '清算' })` … 「清算」の見出しが付いたリストです。項目の文字を、上から順に確かめます

## 動かす

テストは、メンバーも立て替えも無い状態から始めます。前の節までに入れたデータをボリュームごと消して、起動し直します。

```bash
podman compose down --volumes
podman compose up -d --build --wait
```

```bash
npm run test:e2e
```

```text
Running 1 test using 1 worker

  ✓  1 [chromium] › e2e/settlement.spec.ts:3:1 › 3 人の飲み会で A が 10,000 円を立て替えると、B と C から A への支払いが出る (324ms)

  1 passed (672ms)
```

テストのあとの画面を <http://localhost:3000> で開くと、テストが入れたメンバーと立て替えが残っています。データを消さずにもう一度動かすと、メンバーの数が合わずに落ちます。上の 2 つのコマンドでデータを消してから動かします。

テストが落ちたときは、`npx playwright show-report` で、どこで止まったか・そのときの画面を確かめられます。

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [Playwright: Installation](https://playwright.dev/docs/intro) … 入れ方と `npx playwright test`
- [Playwright: Browsers](https://playwright.dev/docs/browsers) … `npx playwright install chromium` と `install-deps`
- [Playwright: Test configuration](https://playwright.dev/docs/test-configuration) … `testDir`・`reporter`・`use.baseURL`・`projects`
- [Playwright: Locators](https://playwright.dev/docs/locators) … `getByLabel()`・`getByRole()`・`getByText()`
- [Playwright: Assertions](https://playwright.dev/docs/test-assertions) … `toHaveCount()`・`toHaveText()`
- [Docker: docker compose down](https://docs.docker.com/reference/cli/docker/compose/down/) … `--volumes`

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::
