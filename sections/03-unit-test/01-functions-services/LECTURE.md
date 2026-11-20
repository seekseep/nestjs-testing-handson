---
docs: true
title: 関数とサービスのテスト
---

# 関数とサービスのテスト

![03 章 関数とサービスのテスト](./images/00-thumbnail.svg)

テストには、確かめる範囲によって 3 つの種類があります。

![3 種類のテストが確かめる範囲。単体テストは 1 つのクラス・関数だけ、結合テストは API 全体を HTTP で、E2E テストはブラウザから画面と API をまとめて確かめる](./images/01-test-types.svg)

| 種類 | 確かめる範囲 | 道具 | 章 |
|---|---|---|---|
| 単体テスト | 1 つのクラス・関数 | Vitest | 03 章 |
| 結合テスト | API 全体（HTTP で呼ぶ） | Vitest ＋ supertest | 04 章 |
| E2E テスト | 画面から API まで | Playwright | 05 章 |

範囲が狭いテストほど速く、こわれた場所をすぐ特定できます。範囲が広いテストほど、利用者が使うときに近い形で確かめられます。

この章では **単体テスト** を書きます。この節では「関数」と「サービス」から始めます。

## テストを動かす

`api/` で `npm test` を実行すると、`*.spec.ts` のファイルがすべて動きます。テストのファイルは、確かめるファイルの隣に置きます。

```bash
cd api
npm test
```

```text
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

## 関数のテスト

ユーザーが `admin` グループに入っているかを決める `isAdmin()`（`src/auth/user.ts`）を確かめます。

::diff{file="api/src/auth/user.spec.ts"}

- `describe('isAdmin', ...)` … テストをまとめる箱です
- `it('...', () => { ... })` … テスト 1 つです。名前には「どうなるべきか」を書きます。テストが落ちたとき、この名前が表示されます
- `expect(値).toBe(期待する値)` … 値が期待どおりかを確かめます。違えばテストが落ちます
- `describe`・`it`・`expect` を import していないのは、`vitest.config.ts` の `globals: true` でどこからも使えるようにしてあるからです

1 つのテストは「用意する → 実行する → 確かめる」の順で書きます。

## 例外を投げる関数のテスト

`Authorization` ヘッダーからトークンを取り出す `extractBearerToken()`（`src/auth/bearer-token.ts`）は、形が違うと例外を投げます。例外も「期待どおりの結果」の 1 つとして確かめます。

::diff{file="api/src/auth/bearer-token.spec.ts"}

- `expect(() => 呼び出し).toThrow(UnauthorizedException)` … 呼んだら、その種類の例外が投げられることを確かめます。`toThrow('Missing bearer token')` のようにメッセージでも確かめられます

`expect()` には、呼び出しの **結果** ではなく **呼び出す関数**（`() => ...`）を渡します。`expect(extractBearerToken(undefined))` と書くと、`expect()` に届く前に例外が投げられてテストが落ちます。

## サービスのテスト

メモを持ち、持ち主を確かめる `NotesService` のテストを、`nest g resource` が作ったテストに書き足します。

::diff{file="api/src/notes/notes.service.spec.ts"}

- `Test.createTestingModule({ providers: [NotesService] })` … NestJS の DI（依存性の注入）の仕組みで `NotesService` を作ります
- `beforeEach(...)` … 各テストの前に動きます。テストごとに `NotesService` を作り直すので、どのテストもメモが空の状態から始まります
- `toMatchObject({...})` … 書いた項目だけを確かめます。`id` や `createdAt` は毎回変わるので書きません
- `toHaveLength(2)` … 配列の長さを確かめます

「他の人のメモは読めない」「admin は他の人のメモも書き換えられる」のような認可の決まりは、まちがえると困るので、単体テストでこまかく確かめておきます。

## 動かす

```bash
npm test
```

```text
 Test Files  3 passed (3)
      Tests  14 passed (14)
```

試しに、`src/notes/notes.service.ts` の `findOne()` の `&& !isAdmin(user)` を消して `npm test` を動かすと、admin のテストが落ち、どの決まりが破れたかがテストの名前で分かります（確かめたら戻してください）。

```text
 FAIL  src/notes/notes.service.spec.ts > NotesService > admin は他の人のメモも書き換えられる
ForbiddenException: Note 7f6c... is not yours
```

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [NestJS: Testing](https://docs.nestjs.com/fundamentals/testing) … テストのファイルの置き場所（クラスの隣に `.spec`）と `Test.createTestingModule()`
- [Vitest: Getting Started](https://vitest.dev/guide/) … `describe`・`it`・`expect` と `vitest` のコマンド
- [Vitest: expect](https://vitest.dev/api/expect) … `toBe`・`toThrow`・`toMatchObject`・`toHaveLength`
- [Vitest: globals](https://vitest.dev/config/globals) … `globals: true`

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::
