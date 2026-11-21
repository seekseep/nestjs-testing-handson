---
docs: true
title: 単体テストを足す
---

# 単体テストを足す

![03 章 単体テストを足す](./images/00-thumbnail.svg)

[単体テストの設計](../01-design/LECTURE.md) の表の残りのケースを足し、10 件をそろえます。

| 関数 | 前の節で書いたもの | この節で足すもの |
|---|---|---|
| `split` | S1 | S2（端数）・S3（0 円）・S4（1 人） |
| `balances` | B1 | B2（払った人が対象でない）・B3（出てこない人） |
| `settle` | なし | T1（ふつう）・T2（組み合わせ）・T3（差し引き 0） |

## テストを足す

::diff{file="api/src/settlement/settle.spec.ts"}

- S2 は、配列が期待どおりかに加えて、合計が元の金額と同じになることも `toBe(10000)` で確かめます。`toBe` は、数のような 1 つの値を比べます
- B3 は、結果の `memberId` だけを取り出して比べます。確かめたいこと（出てこない人が入らないこと）だけを比べると、テストが落ちたときに何が破れたかが分かります

## 動かす

```bash
npm test
```

```text
 ✓ src/settlement/settle.spec.ts (10 tests) 2ms

 Test Files  1 passed (1)
      Tests  10 passed (10)
```

試しに、`src/settlement/settle.ts` の `split()` の `i < rest ? base + 1 : base` を `base` に変えて `npm test` を動かすと、S2 が落ちます。余りの 1 円を付ける決まりが破れたことが、テストの名前で分かります（確かめたら戻します）。

```text
 FAIL  src/settlement/settle.spec.ts > split > 割り切れないときは、前の人から 1 円ずつ足し、合計を元の金額と同じにする
AssertionError: expected [ 3333, 3333, 3333 ] to deeply equal [ 3334, 3333, 3333 ]
```

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [Vitest: expect](https://vitest.dev/api/expect) … `toEqual`・`toBe`

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::
