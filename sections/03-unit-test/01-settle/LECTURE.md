---
docs: true
title: 計算の関数のテスト
---

# 計算の関数のテスト

![03 章 計算の関数のテスト](./images/00-thumbnail.svg)

テストには、確かめる範囲によって 3 つの種類があります。

![アプリは画面・エンドポイント・ロジック・DB の 4 つでできている。単体テスト（03 章）はロジックの計算の関数だけを確かめる。結合テスト（04 章）はテストのコードから HTTP でエンドポイント・ロジック・DB をまとめて確かめ、DB は一時ファイルにする。E2E テスト（05 章）は Podman で動かした画面から DB までをブラウザで確かめる。もっと単体テスト（06 章）は、リポジトリを偽物にしてサービスを確かめる](./images/01-test-types.svg)

| 種類 | 確かめる範囲 | 道具 | 章 |
|---|---|---|---|
| 単体テスト | 1 つの関数・クラスだけ | Vitest | 03 章・06 章 |
| 結合テスト | エンドポイントから DB まで（HTTP で呼ぶ） | Vitest ＋ supertest | 04 章 |
| E2E テスト | 画面から DB まで（ブラウザで操作する） | Playwright | 05 章 |

範囲が狭いテストほど速く、こわれた場所をすぐ特定できます。範囲が広いテストほど、利用者が使うときに近い形で確かめられます。

この章では、DB も HTTP も使わない清算の計算（`split`・`balances`・`settle`）の **単体テスト** を書きます。

## Vitest を入れる

テストの道具には **Vitest** を使います。テストは、Podman ではなく手元の Node.js で動かします。`api/` で入れます。

```bash
npm install -D vitest
```

単体テストのファイルは、確かめるファイルの隣に `<名前>.spec.ts` の名前で置きます。Vitest が見る場所を `src/` の下の `*.spec.ts` に決めておきます。

::diff{file="api/vitest.config.ts"}

`npm test` で Vitest が動くようにします。

::diff{file="api/package.json" base="generated"}

## 計算の関数のテストを書く

::diff{file="api/src/settlement/settle.spec.ts"}

- `describe('split', ...)` … テストをまとめる箱です。関数ごとに分けています
- `it('...', () => { ... })` … テスト 1 つです。名前には「どうなるべきか」を書きます。テストが落ちたとき、この名前が表示されます
- `expect(値).toEqual(期待する値)` … 値が期待どおりかを、配列やオブジェクトの中身まで比べて確かめます
- 割り切れない金額・0 円・1 人・払った人が対象でない・どの立て替えにも出てこない人、のように、まちがえやすい場合を 1 つずつテストにします

1 つのテストは「用意する → 実行する → 確かめる」の順で書きます。

## 動かす

```bash
npm test
```

```text
 ✓ src/settlement/settle.spec.ts (10 tests) 3ms

 Test Files  1 passed (1)
      Tests  10 passed (10)
```

試しに、`src/settlement/settle.ts` の `split()` の `i < rest ? base + 1 : base` を `base` に変えて `npm test` を動かすと、余りの 1 円を足すテストが落ち、どの決まりが破れたかがテストの名前で分かります（確かめたら戻してください）。

```text
 FAIL  src/settlement/settle.spec.ts > split > 割り切れないときは、前の人から 1 円ずつ足し、合計を元の金額と同じにする
AssertionError: expected [ 3333, 3333, 3333 ] to deeply equal [ 3334, 3333, 3333 ]
```

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [Vitest: Getting Started](https://vitest.dev/guide/) … 入れ方と `describe`・`it`・`expect`、`vitest` のコマンド
- [Vitest: Configuring Vitest](https://vitest.dev/config/) … `test.include`
- [Vitest: expect](https://vitest.dev/api/expect) … `toEqual`・`toBe`

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::

:::faq

### `npm install` で `npm warn` や `vulnerabilities` と出る

ライブラリについてのお知らせで、エラーではありません。そのまま進めてかまいません。

:::
