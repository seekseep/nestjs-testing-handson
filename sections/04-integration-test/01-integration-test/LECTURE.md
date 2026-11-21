---
docs: true
title: 結合テスト
---

# 結合テスト

![04 章 結合テスト](./images/00-thumbnail.svg)

アプリを丸ごと組み立てて HTTP で呼び、DB まで書き込んで確かめる **結合テスト** を書きます。確かめるのは次の 2 つです。

- `POST /members`・`POST /payments` で送ったものが、SQLite の表に正しく入る
- `GET /settlement` が、DB の中身から正しい清算を返す

ふだんのデータを消さないように、テストではテストごとに一時ファイルの新しい DB を使います。

## 道具を入れる

NestJS のアプリをテストの中で組み立てる `@nestjs/testing` と、HTTP で呼ぶ **supertest** を入れます。

```bash
npm install -D @nestjs/testing supertest @types/supertest
```

NestJS の公式ドキュメントは、このようなテストを「e2e テスト」と呼びます。このハンズオンでは、ブラウザで画面を操作するテスト（次の章）を E2E テストと呼ぶので、こちらは **結合テスト** と呼び、`test/<名前>.integration-spec.ts` の名前で置きます。結合テスト用の Vitest の設定を作り、`npm run test:integration` で動くようにします。

::diff{file="api/vitest.config.integration.ts"}

::diff{file="api/package.json" base="generated"}

`npm test`（`vitest.config.ts`）は `src/` の下だけを見るので、結合テストは入りません。速い単体テストと分けて動かせます。

## 結合テストを書く

::diff{file="api/test/settlement.integration-spec.ts"}

- `process.env.DB_PATH = dbPath` … コントローラーは `openDatabase()` で、`DB_PATH` のファイルを開きます。アプリを組み立てる前に、一時フォルダ（`tmpdir()`）の新しいファイルを指しておきます。テストが終わったら `rmSync()` で消します
- `Test.createTestingModule({ imports: [AppModule] })` … テストの中で、アプリと同じモジュールを組み立てます。`createNestApplication()` と `init()` で、ポートを開かずに HTTP を受けられる状態にします
- `request(app.getHttpServer()).post('/members').send({ name })` … supertest で HTTP を送ります。`.expect(201)` でステータスコードを確かめます
- `new DatabaseSync(dbPath)` … API を通さずにファイルを直接開き、表に入ったものを SQL で読んで確かめます

## 動かす

```bash
npm run test:integration
```

```text
 ✓ test/settlement.integration-spec.ts (3 tests) 40ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [NestJS: Testing](https://docs.nestjs.com/fundamentals/testing) … `Test.createTestingModule()` と、supertest で HTTP を送るテスト
- [Vitest: Configuring Vitest](https://vitest.dev/config/) … `--config` で設定のファイルを選ぶ
- [Node.js: os.tmpdir()](https://nodejs.org/docs/latest-v26.x/api/os.html#ostmpdir) … 一時フォルダの場所
- [Node.js: SQLite](https://nodejs.org/docs/latest-v26.x/api/sqlite.html) … `DatabaseSync` と `prepare().all()`

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::
