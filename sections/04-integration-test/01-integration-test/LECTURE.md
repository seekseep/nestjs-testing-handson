---
docs: true
title: 結合テスト
---

# 結合テスト

![04 章 結合テスト](./images/00-thumbnail.svg)

単体テストでは、部品を 1 つずつ切り離して確かめました。でも、次のことは部品を 1 つずつ見ても分かりません。

- `NotesController` に `AuthGuard` が掛かっていて、トークンが無ければ `401` になるか
- 入力チェックが効いて、決まりに合わない入力が `400` になるか
- コントローラーが、Guard の入れたユーザーをサービスに渡し、他の人のメモが `403` になるか

この章では、API を丸ごと組み立てて HTTP で呼ぶ **結合テスト** を書きます。HTTP で呼ぶのには **supertest** を使います。

## テストでの認証は「トークンの直書き」にする

`TokenVerifier` は Cognito を見る作りなので、この環境ではどのトークンも通りません。そこで、このハンズオンでは、テストでの認証を **トークンの直書き** にします。`alice-token` のような決め打ちの文字列をトークンとして送り、API の側では `TokenVerifier` だけを、その文字列をユーザーに対応させる偽物に差し替えます。

| 送るトークン | ユーザー |
|---|---|
| `alice-token` | `alice` |
| `bob-token` | `bob` |
| `admin-token` | `admin`（`admin` グループ） |

:::warning
**本来は、テストの認証は別の仕組みで行います。** たとえば、テスト用のユーザーで実際にサインインする、テスト用の鍵で署名したトークンで本物の検証を通す、といったやり方です。このハンズオンでは、テストの書き方に集中するため、これらには触れません。

決め打ちのトークンでは、「Cognito が出した本物のトークンを、正しく検証できるか」は確かめられません。
:::

## 偽物の TokenVerifier

::diff{file="api/src/auth/fake-token-verifier.ts"}

- `FAKE_TOKENS` … 決め打ちのトークンと、それが表すユーザーの対応表です
- `implements Pick<TokenVerifier, 'verify'>` … 本物と同じ形の `verify()` を持つことを、TypeScript に確かめさせます
- トークンが無い・形が違うときは、本物と同じ `extractBearerToken()` で `401` にします

`test/` ではなく `src/` に置くのは、次の章の E2E テストで、起動した API からも使うためです。

## アプリの設定を 1 か所にまとめる

結合テストでは `main.ts` を通らずにアプリを作るので、`main.ts` に書いた入力チェックの Pipe が入りません。設定を関数に切り出して、`main.ts` とテストの両方から呼ぶようにします。

::diff{file="api/src/app.setup.ts"}

::diff{file="api/src/main.ts"}

画面を配る `useStaticAssets()` は、結合テストでは使わないので `main.ts` に残しました。

## 結合テストの設定

NestJS の公式ドキュメントは、このようなテストを「e2e テスト」と呼びます。このハンズオンでは、ブラウザから画面を操作するテスト（次の章）を E2E テストと呼ぶので、こちらは **結合テスト** と呼び、`test/<名前>.integration-spec.ts` の名前で置きます。

::diff{file="api/vitest.config.integration.ts"}

`include` で `*.integration-spec.ts` だけを動かします。`npm test` には入らないので、速い単体テストと分けて動かせます。

::diff{file="api/package.json"}

## 結合テストを書く

::diff{file="api/test/notes.integration-spec.ts"}

- `Test.createTestingModule({ imports: [AppModule] })` … 本物の `AppModule` を、そのまま組み立てます
- `.overrideProvider(TokenVerifier).useClass(FakeTokenVerifier)` … `TokenVerifier` だけを偽物に差し替えます。Guard・Pipe・コントローラー・サービスは本物のままなので、「トークンが無ければ 401」も確かめられます
- `setupApp(app)` … `main.ts` と同じ設定を入れます
- `request(app.getHttpServer())` … supertest で HTTP のリクエストを送ります。API を `npm start` で起動しておく必要はありません
- `.set(as('alice-token'))` … `Authorization: Bearer alice-token` を付けます
- `.send({...})` で本文（JSON）を送り、`.expect(201)` でステータスコードを確かめます。本文は `res.body` で受け取って確かめます
- `beforeEach` でアプリを作り直し、`afterEach` で閉じます。テストごとにメモが空の状態から始まります

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

試しに、`setupApp(app);` を消して動かすと、入力チェックが効かなくなり、2 つのテストが落ちます。単体テストでは気づけない、組み合わせの間違いです（確かめたら戻してください）。

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

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::
