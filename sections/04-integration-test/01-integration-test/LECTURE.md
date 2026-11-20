---
docs: true
title: 結合テスト
---

# 結合テスト

![04 章 結合テスト](./images/00-thumbnail.svg)

03 章の単体テストでは、部品を 1 つずつ切り離して確かめました。でも、API はたくさんの部品が組み合わさって動いています。

- `NotesController` に `AuthGuard` が掛かっていて、トークンが無ければ `401` になるか
- `@Body({ schema })` の入力チェックが効いて、決まりに合わない入力が `400` になるか
- コントローラーが、Guard の入れたユーザーをサービスに渡し、他の人のメモが `403` になるか

これは部品を 1 つずつ見ても分かりません。この章では、API を丸ごと組み立てて HTTP で呼ぶ **結合テスト** を書きます。HTTP で呼ぶのには、`nest new` が入れている **supertest** を使います。

## テストでの認証は「トークンの直書き」にする

メモの API は、正しいトークンが無いと `401` を返します。はじめのプロジェクトのトークンの検証（`TokenVerifier`）は Cognito を見る作りで、Cognito が無いこの環境では、どのトークンも通りません。Cognito があったとしても、テストのたびにサインインしてトークンを取るのは大変です。トークンには期限があり、テストが Cognito に左右されるようにもなります。

そこで、このハンズオンでは、テストでの認証を **トークンの直書き** にします。`alice-token` のような決め打ちの文字列をトークンとして送り、API の側ではトークンの検証（`TokenVerifier`）だけを、その文字列をユーザーに対応させる偽物に差し替えます。

| 送るトークン | ユーザー |
|---|---|
| `alice-token` | `alice` |
| `bob-token` | `bob` |
| `admin-token` | `admin`（`admin` グループ） |

:::warning
**本来は、テストの認証は別の仕組みで行います。** たとえば、テスト用のユーザープールとテスト用のユーザーを用意して実際にサインインする、テスト用の鍵で署名したトークンを作って本物の検証を通す、といったやり方です。このハンズオンでは、テストの書き方に集中するため、これらには触れません。

決め打ちのトークンでは、「Cognito が出した本物のトークンを、正しく検証できるか」は確かめられません。
:::

## 偽物の TokenVerifier

::diff{file="api/src/auth/fake-token-verifier.ts"}

- `FAKE_TOKENS` … 決め打ちのトークンと、それが表すユーザーの対応表です
- `implements Pick<TokenVerifier, 'verify'>` … 本物の `TokenVerifier` と同じ形の `verify()` を持つことを、TypeScript に確かめさせます。本物のほうの引数や戻り値を変えたら、ここで型エラーになります
- トークンが無い・形が違うときは、本物と同じ `extractBearerToken()` で `401` にします

`test/` ではなく `src/` に置くのは、次の章の E2E テストで、起動した API からも使うためです。

## アプリの設定を 1 か所にまとめる

結合テストでは、`main.ts` を通らずにアプリを作ります。そのため、`main.ts` に書いた設定（入力チェックの Pipe）が、テストでは入りません。入力チェックが効かないまま、テストが動いてしまいます。

設定を関数に切り出して、`main.ts` とテストの両方から呼ぶようにします。

::diff{file="api/src/app.setup.ts"}

::diff{file="api/src/main.ts"}

画面を配る `useStaticAssets()` は、`main.ts` に残しました。結合テストでは画面を使わないからです。

## 結合テストの設定

NestJS の公式ドキュメントでは、アプリを丸ごと組み立てて HTTP で呼ぶテストを「e2e テスト」と呼び、`test/` に `.e2e-spec.ts` の名前で置きます。このハンズオンでは、ブラウザから画面を操作するテスト（次の章）を E2E テストと呼ぶので、こちらは **結合テスト**（integration）と呼び、`test/<名前>.integration-spec.ts` の名前で置きます。

::diff{file="api/vitest.config.integration.ts"}

`include` で、`*.integration-spec.ts` だけを動かします。`npm test`（`vitest.config.ts` の `**/*.spec.ts`）には、`.integration-spec.ts` は入りません（`.spec.ts` で終わっていないため）。速い単体テストと分けて動かせます。

::diff{file="api/package.json"}

## 結合テストを書く

::diff{file="api/test/notes.integration-spec.ts"}

- `Test.createTestingModule({ imports: [AppModule] })` … 本物の `AppModule` を、そのまま組み立てます
- `.overrideProvider(TokenVerifier).useClass(FakeTokenVerifier)` … `TokenVerifier` だけを偽物に差し替えます。`AuthGuard` は DI で `TokenVerifier` を受け取っているので、Guard に偽物が渡ります。Guard・Pipe・コントローラー・サービスは本物のままです
- `setupApp(app)` … `main.ts` と同じ設定を入れます
- `request(app.getHttpServer())` … supertest で、HTTP のリクエストを送ります
- `.set(as('alice-token'))` … `Authorization: Bearer alice-token` を付けます
- `.send({...})` … 本文（JSON）を送ります
- `.expect(201)` … ステータスコードを確かめます。本文は `res.body` で受け取って、`expect` で確かめます
- `beforeEach` でアプリを作り直し、`afterEach` で閉じます。テストごとにメモが空の状態から始まります

入力チェックのエラーの本文は、NestJS の既定の形（`{ "message": [...], "error": "Bad Request", "statusCode": 400 }`）です。`message` には、項目ごとに `title: Too small: ...` のような説明が入ります。

## 動かす

```bash
cd api
npm run test:integration
```

```text
 ✓ test/notes.integration-spec.ts (7 tests) 77ms

 Test Files  1 passed (1)
      Tests  7 passed (7)
```

Cognito の ID（`api/.env`）が無くても動きます。

試しに、`test/notes.integration-spec.ts` の `setupApp(app);` を消して動かしてみてください。入力チェックが効かなくなり、2 つのテストが落ちます。単体テストでは気づけない、組み合わせの間違いです（確かめたら戻してください）。

```text
 FAIL  test/notes.integration-spec.ts > メモの API（結合テスト） > メモ > タイトルが空なら 400 で、理由が message に入る
Error: expected 400 "Bad Request", got 201 "Created"
 FAIL  test/notes.integration-spec.ts > メモの API（結合テスト） > メモ > ID が UUID の形でなければ 400
Error: expected 400 "Bad Request", got 404 "Not Found"
```

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [NestJS: Testing](https://docs.nestjs.com/fundamentals/testing) … アプリを丸ごと組み立てて HTTP で呼ぶテスト（`createNestApplication()`・`app.init()`・`request(app.getHttpServer())`）と `overrideProvider()`
- [supertest（README）](https://github.com/ladjs/supertest) … `.set()`・`.send()`・`.expect()` の使い方
- [NestJS: Validation](https://docs.nestjs.com/application/validation) … 入力チェックのエラーの本文の形

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::

:::faq

### 単体テストと結合テストは、どちらを書けばいい？

両方です。判定のこまかい組み合わせ（他の人のメモ・admin・無いメモなど）は、速くて原因の分かりやすい単体テストで確かめます。結合テストでは、「部品がつながっているか」を、代表的な場面で確かめます。

### `npm test` で結合テストも一緒に動かしたい

`vitest.config.ts` の `include` に `'**/*.integration-spec.ts'` を足すと、一緒に動きます。この章では、あとで遅いテストが増えても分けて動かせるように、別にしています。

### API を起動していなくていいの？

`request(app.getHttpServer())` は、まだ待ち受けていないサーバーを受け取ると、空いているポートで一時的に待ち受けて呼び、終わったら閉じます。`npm start` で API が 3000 番を使っていても、ぶつかりません。

### Guard ごと差し替えてもいい？

`overrideGuard(AuthGuard)` で Guard そのものを差し替えることもできます。ただ、そうすると「トークンが無ければ 401」を確かめられなくなります。この章では、Guard は本物のまま、その先のトークンの検証だけを差し替えています。

:::
