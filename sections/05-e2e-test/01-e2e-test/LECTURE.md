---
docs: true
title: E2E テスト
---

# E2E テスト

![05 章 E2E テスト](./images/00-thumbnail.svg)

最後に、API を起動してブラウザで画面を開き、画面から API までをまとめて確かめる **E2E（End to End）テスト** を **Playwright** で書きます。Playwright はブラウザを動かし、人と同じように画面を開いて表示を確かめます。

この節では、次の 2 つを確かめます。

- API で作ったノートが、一覧の画面（`/notes.html`）に出る
- API で消したノートは、一覧の画面から消える

## E2E テストでの認証も「トークンの直書き」にする

04 章と同じく、テストの認証は **トークンの直書き** にします。

- API は、環境変数 `USE_FAKE_AUTH` が `true` のときだけ、04 章の `FakeTokenVerifier` を使う
- テストは、ノートの作成・削除の API に `Authorization: Bearer alice-token` を付けて呼ぶ

:::warning
**本来は、E2E テストの認証は別の仕組みで行います。** たとえば、テスト用のユーザーで本当にサインインし、そのときのブラウザの状態を保存して各テストで使い回します（Playwright の「setup project」と `storageState`）。このハンズオンでは、テストの書き方に集中するため、これには触れません。
:::

## API を偽物の認証に切り替えられるようにする

`AppModule` で、`TokenVerifier` として渡すクラスを、環境変数で選ぶようにします。

::diff{file="api/src/app.module.ts"}

- `{ provide: TokenVerifier, useClass: ... }` … 「`TokenVerifier` が欲しいところには、このクラスを作って渡す」という書き方です。`AuthMiddleware` は書き換えずに済みます
- `process.env.USE_FAKE_AUTH === 'true'` … `true` という文字のときだけ偽物にします。書き忘れや書き間違いでは、本物のままです

偽物を使っているときは、起動のログに警告を出すようにします。

::diff{file="api/src/auth/fake-token-verifier.ts"}

```text
WARN [FakeTokenVerifier] 決め打ちのトークンで認証しています。テスト専用です
```

:::danger
`USE_FAKE_AUTH=true` のまま本番で動かすと、`alice-token` を知っているだれもが、そのユーザーとして API を使えてしまいます。本番の環境変数には、決して書かないでください。
:::

## Playwright を入れる

`api/` で、Playwright と、テストに使うブラウザ（Chromium）を入れます。

```bash
npm install -D @playwright/test
npx playwright install chromium
```

Linux（Ubuntu など）で、テストの起動時にブラウザの部品が足りないというエラーが出たら、`npx playwright install-deps chromium` で入れます（`sudo` のパスワードを聞かれます）。

`scripts` に `test:e2e` を足し、Playwright が作る結果とレポートを Git に入れないようにします。

::diff{file="api/package.json" base="generated"}

::diff{file="api/.gitignore"}

Playwright のテストも `*.spec.ts` の名前にしますが、`npm test`（Vitest）は `src/` の下だけを見るので、混ざりません。

## Playwright の設定

::diff{file="api/playwright.config.ts"}

- `testDir: './e2e'` … テストは `e2e/` に置きます
- `use.baseURL` … `page.goto('/notes.html')` や `request.post('/notes')` のように、パスだけで呼べるようになります
- `projects` … どのブラウザで動かすかです。ここでは Chromium だけです
- `webServer` … テストの前に `command` で API を起動し、`url` に応答が返るまで待ってからテストを始め、終わったら止めます。`env` で `PORT` を 3100 に、`USE_FAKE_AUTH` を `true` にします
- `reuseExistingServer: !process.env.CI` … 手元では、3100 番でもう動いていれば、起動せずにそれを使います

ポートを 3100 にしているのは、ふだんの `npm start` の 3000 とぶつからないようにするためです。同じポートだと、`reuseExistingServer` が偽物の認証になっていない API をそのまま使ってしまい、作成が `401` で落ちます。

## E2E テストを書く

::diff{file="api/e2e/notes.spec.ts"}

- `test('...', async ({ page, request }) => { ... })` … `page` は、Playwright が開いたブラウザのタブです。`request` は、API を直接呼ぶための道具です
- `request.post('/notes', { headers: asAlice, data: { text } })` … 決め打ちのトークンを付けて、ノートを作ります。`data` は JSON で送られます
- `page.goto('/notes.html')` … 一覧の画面を開きます。画面は開いたときに `GET /notes` を呼んで、ノートを並べます
- `page.getByRole('listitem').filter({ hasText: text })` … 画面の要素を、**利用者から見える手がかり**（役割と文言）で探します。ここでは、そのノートの文を含む一覧の項目（`<li>`）です
- `await expect(locator).toBeVisible()` … 表示されるまで（既定は 5 秒）待ちながら確かめ続けます。画面が API の応答を待つための `sleep` は要りません。`toHaveCount(0)` は「無くなるまで待つ」です
- `page.reload()` … 画面を読み込み直して、消したあとの一覧を出し直します
- `uniqueText()` … API のノートはテストの間で共有されるので、テストごとに違う文にして混ざらないようにしています

## 動かす

```bash
npm run test:e2e
```

```text
Running 2 tests using 1 worker

  ✓  1 [chromium] › e2e/notes.spec.ts:11:1 › API で作ったノートが、一覧の画面に出る (264ms)
  ✓  2 [chromium] › e2e/notes.spec.ts:21:1 › API で消したノートは、一覧の画面から消える (77ms)

  2 passed (2.8s)
```

テストが落ちたときは、`npx playwright show-report` で、どこで止まったか・そのときの画面を確かめられます。

## このハンズオンでそろったテスト

| 種類 | コマンド（`api/` で） | 場所 | 数 |
|---|---|---|---|
| 単体テスト | `npm test` | `src/**/*.spec.ts` | 6 |
| 結合テスト | `npm run test:integration` | `test/*.integration-spec.ts` | 6 |
| E2E テスト | `npm run test:e2e` | `e2e/*.spec.ts` | 2 |

どれも、Cognito（AWS のアカウント）が無くても動きます。トークンの検証だけを偽物に差し替え、それ以外の部品（middleware・コントローラー・サービス・画面）は本物のまま確かめました。

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [Playwright: Installation](https://playwright.dev/docs/intro) … 入れ方と `npx playwright test`
- [Playwright: Web server](https://playwright.dev/docs/test-webserver) … `webServer` でテストの前にサーバーを起動する（`command`・`url`・`env`・`reuseExistingServer`）
- [Playwright: API testing](https://playwright.dev/docs/api-testing) … `request` で API を呼ぶ（`post()`・`delete()`、`headers`・`data`）
- [Playwright: Authentication](https://playwright.dev/docs/auth) … 本来の認証のやり方（setup project と `storageState`）
- [Playwright: Locators](https://playwright.dev/docs/locators) … `getByRole()`・`filter()`
- [Playwright: Assertions](https://playwright.dev/docs/test-assertions) … 待ちながら確かめる `toBeVisible()`・`toHaveCount()`
- [Playwright: Reporters](https://playwright.dev/docs/test-reporters) … `show-report`
- [Playwright: Browsers](https://playwright.dev/docs/browsers) … ブラウザの入れ方と `install-deps`
- [NestJS: Custom providers](https://docs.nestjs.com/fundamentals/custom-providers) … `{ provide, useClass }` で渡すクラスを選ぶ

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::

:::faq

### 作成が `401`（`Invalid token`）で落ちる

偽物の認証になっていない API を使っています。3100 番で、`USE_FAKE_AUTH` を付けずに起動した API が動いていないか確かめ、止めてから動かし直してください。

### `Process from config.webServer was not able to start` と出る

Playwright が API を起動できませんでした。すぐ上に理由が出ています。`EADDRINUSE: address already in use :::3100` なら、3100 番をほかのプログラムが使っているので止めてください。

:::
