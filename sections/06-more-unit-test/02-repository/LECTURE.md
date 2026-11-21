---
docs: true
title: SQL をリポジトリに分ける
---

# SQL をリポジトリに分ける

![06 章 SQL をリポジトリに分ける](./images/00-thumbnail.svg)

コントローラーに書いてある SQL を、表ごとの **リポジトリ** に移します。立て替えを読む SQL は `PaymentsController` と `SettlementController` の 2 か所にありましたが、`PaymentsRepository` の 1 か所にまとまります。

::diff{file="api/src/members/members.repository.ts"}

::diff{file="api/src/payments/payments.repository.ts"}

- メソッドの中身は、コントローラーにあったものをそのまま移しています
- `@Injectable()` … NestJS が作って、ほかのクラスに渡せるようにする印です。DB は前の節と同じく、コンストラクターで受け取ります

リポジトリを登録し、コントローラーはリポジトリを受け取って呼ぶだけにします。

::diff{file="api/src/app.module.ts"}

::diff{file="api/src/members/members.controller.ts"}

::diff{file="api/src/payments/payments.controller.ts"}

::diff{file="api/src/settlement/settlement.controller.ts"}

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

- [NestJS: Providers](https://docs.nestjs.com/providers) … `@Injectable()` と、コンストラクターでの依存性の注入

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::
