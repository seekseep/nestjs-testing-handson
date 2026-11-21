---
docs: true
title: DB をプロバイダーにする
---

# DB をプロバイダーにする

![06 章 DB をプロバイダーにする](./images/00-thumbnail.svg)

03 章で単体テストできたのは、DB も HTTP も使わない計算の関数だけでした。清算を出すところ（`SettlementController`）は、自分で DB を開いて SQL を書いているので、DB 無しでは確かめられません。この章では、NestJS の **DI**（依存性の注入）を使う形に少しずつ書き換え、清算を出すところも単体テストできるようにします。

この節では、各コントローラーが `openDatabase()` で DB を開くのをやめ、NestJS から受け取るようにします。

::diff{file="api/src/app.module.ts"}

- `{ provide: DatabaseSync, useFactory: () => openDatabase() }` … 「`DatabaseSync` を受け取りたいクラスには、`openDatabase()` が返したものを渡す」という登録です。NestJS は `openDatabase()` を 1 回だけ呼び、同じ DB を使い回します

::diff{file="api/src/members/members.controller.ts"}

::diff{file="api/src/payments/payments.controller.ts"}

::diff{file="api/src/settlement/settlement.controller.ts"}

- `constructor(private readonly db: DatabaseSync)` … 引数の型を見て、NestJS が上で登録した DB を渡します

## 振る舞いが変わっていないことを確かめる

04 章の結合テストを動かします。テストのコードは変えていません。

```bash
npm run test:integration
```

```text
 Test Files  1 passed (1)
      Tests  3 passed (3)
```

コードを書き換えても、HTTP で呼んだときの振る舞いは変わっていません。

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [NestJS: Custom providers](https://docs.nestjs.com/fundamentals/custom-providers) … `provide` と `useFactory`

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::
