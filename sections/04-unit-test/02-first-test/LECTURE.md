---
docs: true
title: 単体テストを書く
---

# 単体テストを書く

![04 章 単体テストを書く](./images/00-thumbnail.svg)

前の節で設計した表のうち、ふつうの場合の S1（`split`）と B1（`balances`）をテストに書いて動かします。

## Vitest の場所を確かめる

テストは、Podman ではなく手元の Node.js で動かします。`api/` で、ライブラリを入れます。

```bash
cd api
npm install
```

テストの道具の **Vitest** は、`nest new` がはじめから入れています。新しく入れるものはありません。

| ファイル | 中身 |
|---|---|
| `package.json` | `devDependencies` に `vitest`。`scripts` の `test` は `vitest run` |
| `vitest.config.ts` | `include: ['**/*.spec.ts']`。名前が `.spec.ts` で終わるファイルをテストとして動かす |

そこで、単体テストのファイルは、確かめるファイルの隣に `<名前>.spec.ts` の名前で置きます。`settle.ts` のテストは `settle.spec.ts` です。

## テストを書く

::diff{file="api/src/settlement/settle.spec.ts"}

- `describe('split', ...)` … テストをまとめる箱です。関数ごとに分けます
- `it('...', () => { ... })` … テスト 1 つです。名前には「どうなるべきか」を書きます。テストが落ちたとき、この名前が表示されます
- `expect(結果).toEqual(期待する結果)` … 結果が期待どおりかを、配列やオブジェクトの中身まで比べて確かめます
- `// S1`・`// B1` … 設計の表の番号です。表とテストを行き来できるように付けておきます

## 動かす

```bash
npm test
```

```text
 ✓ src/settlement/settle.spec.ts (2 tests) 2ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
```

## 失敗したときの表示を見る

試しに、S1 の期待する結果を `[3000, 3000, 3001]` にまちがえて、`npm test` を動かします。

```text
 FAIL  src/settlement/settle.spec.ts > split > 割り切れるときは、同じ額に分ける
AssertionError: expected [ 3000, 3000, 3000 ] to deeply equal [ 3000, 3000, 3001 ]

- Expected
+ Received

  [
    3000,
    3000,
-   3001,
+   3000,
  ]
```

落ちたテストの名前と、期待する結果（`Expected`）と実際の結果（`Received`）の違いが出ます。確かめたら、`[3000, 3000, 3000]` に戻します。

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [Vitest: Getting Started](https://vitest.dev/guide/) … `describe`・`it`・`expect` と、`vitest run` のコマンド
- [Vitest: Configuring Vitest](https://vitest.dev/config/) … `test.include`
- [Vitest: expect](https://vitest.dev/api/expect) … `toEqual`

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::

:::faq

### `npm install` で `npm warn` や `vulnerabilities` と出る

ライブラリについてのお知らせで、エラーではありません。そのまま進めます。

:::
