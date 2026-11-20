---
docs: true
title: E2E テスト
---

# E2E テスト

![05 章 E2E テスト](./images/00-thumbnail.svg)

最後に、ブラウザで画面を操作して、画面から API までをまとめて確かめる **E2E（End to End）テスト** を **Playwright** で書きます。Playwright はブラウザを動かし、人と同じように入力欄に文字を入れ、ボタンを押し、表示を確かめます。

この節では、次の 3 つを確かめます。

- メモを追加すると一覧に出て、読み込み直しても残っている
- 削除すると一覧から消える
- タイトルが空だと、API の入力チェックのエラーが画面に出る

## E2E テストでの認証も「トークンの直書き」にする

04 章と同じく、テストの認証は **トークンの直書き** にします。

- API は、環境変数 `USE_FAKE_AUTH` が `true` のときだけ、04 章の `FakeTokenVerifier` を使う
- 画面は `sessionStorage` の `token` を読んで API に送る作りなので、Playwright で、画面のスクリプトが動く前に `alice-token` を入れておく

:::warning
**本来は、E2E テストの認証は別の仕組みで行います。** たとえば、テスト用のユーザーで本当にサインインし、そのときのブラウザの状態を保存して各テストで使い回します（Playwright の「setup project」と `storageState`）。このハンズオンでは、テストの書き方に集中するため、これには触れません。
:::

## API を偽物の認証に切り替えられるようにする

`AuthModule` で、`TokenVerifier` として渡すクラスを、環境変数で選ぶようにします。

::diff{file="api/src/auth/auth.module.ts"}

- `{ provide: TokenVerifier, useClass: ... }` … 「`TokenVerifier` が欲しいところには、このクラスを作って渡す」という書き方です。`AuthGuard` は書き換えずに済みます
- `process.env.USE_FAKE_AUTH === 'true'` … `true` という文字のときだけ偽物にします。書き忘れや書き間違いでは、本物のままです

偽物を使っているときは、起動のログに警告を出すようにします。

::diff{file="api/src/auth/fake-token-verifier.ts"}

```text
WARN [FakeTokenVerifier] 決め打ちのトークンで認証しています。テスト専用です
```

:::danger
`USE_FAKE_AUTH=true` のまま本番で動かすと、`alice-token` や `admin-token` を知っているだれもが、そのユーザーとして API を使えてしまいます。本番の環境変数には、決して書かないでください。
:::

## Playwright を入れる

`api/` で、Playwright と、テストに使うブラウザ（Chromium）を入れます。

```bash
npm install -D @playwright/test
npx playwright install chromium
```

Linux（Ubuntu など）で、テストの起動時にブラウザの部品が足りないというエラーが出たら、`npx playwright install-deps chromium` で入れます（`sudo` のパスワードを聞かれます）。

`scripts` に `test:e2e` を足します（`devDependencies` は `npm install` で入っています）。

::diff{file="api/package.json"}

Playwright が作る結果とレポートは、Git に入れないようにします。

::diff{file="api/.gitignore"}

Playwright のテストも `*.spec.ts` の名前にするので、このままだと `npm test`（Vitest）が拾って落ちます。Vitest が見る場所を `src/` の下に絞ります。

::diff{file="api/vitest.config.ts"}

## Playwright の設定

::diff{file="api/playwright.config.ts"}

- `testDir: './e2e'` … テストは `e2e/` に置きます
- `use.baseURL` … `page.goto('/')` のように、パスだけで画面を開けるようになります
- `projects` … どのブラウザで動かすかです。ここでは Chromium だけです
- `webServer` … テストの前に `command` で API を起動し、`url` に応答が返るまで待ってからテストを始め、終わったら止めます。`env` で `PORT` を 3100 に、`USE_FAKE_AUTH` を `true` にします
- `reuseExistingServer: !process.env.CI` … 手元では、3100 番でもう動いていれば、起動せずにそれを使います

ポートを 3100 にしているのは、ふだんの `npm start` の 3000 とぶつからないようにするためです。同じポートだと、`reuseExistingServer` が偽物の認証になっていない API をそのまま使ってしまい、どのテストも `401` で落ちます。

## E2E テストを書く

::diff{file="api/e2e/notes.spec.ts"}

- `test('...', async ({ page }) => { ... })` … `page` は、Playwright が開いたブラウザのタブです。テストごとにまっさらなタブが用意されます
- `page.addInitScript(() => { ... })` … ページを開くたびに、ページのスクリプトより **先に** 動くスクリプトを足します。ここで `sessionStorage` に `alice-token` を入れるので、画面は最初から alice として API を呼びます
- `page.getByPlaceholder('タイトル')`・`page.getByRole('button', { name: '追加' })` … 画面の要素を、**利用者から見える手がかり**（文言・役割）で探します
- `.fill()`・`.click()` … 文字を入れる・押す操作です。要素が操作できるようになるまで自動で待ちます
- `getByRole('listitem').filter({ hasText: title })` … 一覧の項目のうち、そのタイトルを含むものに絞ります
- `await expect(locator).toBeVisible()` … 表示されるまで（既定は 5 秒）待ちながら確かめ続けます。API の応答を待つための `sleep` は要りません。`toHaveCount(0)` は「無くなるまで待つ」です
- `uniqueTitle()` … API のメモはテストの間で共有されるので、テストごとに違うタイトルにして混ざらないようにしています

## 動かす

```bash
npm run test:e2e
```

```text
Running 3 tests using 1 worker

  ✓  1 [chromium] › e2e/notes.spec.ts:16:1 › メモを追加すると一覧に出て、読み込み直しても残っている (317ms)
  ✓  2 [chromium] › e2e/notes.spec.ts:35:1 › 削除すると一覧から消える (177ms)
  ✓  3 [chromium] › e2e/notes.spec.ts:46:1 › タイトルが空だと、API の入力チェックのエラーが出る (114ms)

  3 passed (3.0s)
```

テストが落ちたときは、`npx playwright show-report` で、どこで止まったか・そのときの画面を確かめられます。

## このハンズオンでそろったテスト

| 種類 | コマンド（`api/` で） | 場所 | 数 |
|---|---|---|---|
| 単体テスト | `npm test` | `src/**/*.spec.ts` | 16 |
| 結合テスト | `npm run test:integration` | `test/*.integration-spec.ts` | 7 |
| E2E テスト | `npm run test:e2e` | `e2e/*.spec.ts` | 3 |

どれも、Cognito（AWS のアカウント）が無くても動きます。トークンの検証だけを偽物に差し替え、それ以外の部品（Guard・Pipe・コントローラー・サービス・画面）は本物のまま確かめました。

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [Playwright: Installation](https://playwright.dev/docs/intro) … 入れ方と `npx playwright test`
- [Playwright: Web server](https://playwright.dev/docs/test-webserver) … `webServer` でテストの前にサーバーを起動する（`command`・`url`・`env`・`reuseExistingServer`）
- [Playwright: Page](https://playwright.dev/docs/api/class-page#page-add-init-script) … `page.addInitScript()` がページのスクリプトより先に動くこと
- [Playwright: Authentication](https://playwright.dev/docs/auth) … 本来の認証のやり方（setup project と `storageState`）と、`sessionStorage` を `addInitScript()` で入れる方法
- [Playwright: Locators](https://playwright.dev/docs/locators) … `getByRole()`・`getByPlaceholder()`・`filter()`
- [Playwright: Assertions](https://playwright.dev/docs/test-assertions) … 待ちながら確かめる `toBeVisible()`・`toContainText()`・`toHaveCount()`
- [Playwright: Reporters](https://playwright.dev/docs/test-reporters) … `show-report`
- [Playwright: Browsers](https://playwright.dev/docs/browsers) … ブラウザの入れ方と `install-deps`
- [NestJS: Custom providers](https://docs.nestjs.com/fundamentals/custom-providers) … `{ provide, useClass }` で渡すクラスを選ぶ

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::

:::faq

### どのテストも `401`（`Missing bearer token` や `Invalid token`）で落ちる

偽物の認証になっていない API を使っています。3100 番で、`USE_FAKE_AUTH` を付けずに起動した API が動いていないか確かめ、止めてから動かし直してください。

### `Process from config.webServer was not able to start` と出る

Playwright が API を起動できませんでした。すぐ上に理由が出ています。`EADDRINUSE: address already in use :::3100` なら、3100 番をほかのプログラムが使っているので止めてください。

:::
