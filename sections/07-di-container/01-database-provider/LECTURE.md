---
docs: true
title: DB をプロバイダーにする
---

# DB をプロバイダーにする

![07 章 DB をプロバイダーにする](./images/00-thumbnail.svg)

NestJS では、ふつう処理をサービスに切り出します。このハンズオンでは、04〜06 章であえて切り出さず、コントローラーに直接書いてきました。そのため、DB を使う処理（清算を出すところ）は、05 章の結合テスト（アプリを丸ごと組み立てて、HTTP で呼び、本物の DB に書き込む）でしか確かめられませんでした。

この章では、NestJS の **DI コンテナ** を使って、DB・リポジトリ・サービスを切り出します。サービスに切り出すと、これまで結合テストでしか確かめられなかったことが、アプリも DB も実際に起動しなくても確かめられるようになります。

## DI コンテナがしていること

![DI コンテナのしくみ。アプリを動かすときは、① AppModule の providers にクラスを登録し、② DI コンテナ（NestJS）がインスタンスを作り、③ コンストラクターで受け取りたい SettlementService に本物のリポジトリを注入する。単体テストのときは、DI コンテナを通さず、偽物のリポジトリを new で SettlementService に渡す](./images/01-di-container.svg)

モジュールの `providers` に登録したクラスは、NestJS（DI コンテナ）がインスタンスを作り、コンストラクターでそれを受け取りたいクラスに渡します（注入）。受け取る側は、自分で相手を作らないので、テストでは本物の代わりに偽物を渡せます。

各節の最後に、05 章の結合テストで動きが変わっていないことを確かめます。

## DB を DatabaseModule に分ける

今は、3 つのコントローラーが、それぞれ DB を開き、SQL を書いています。この章の図では、節ごとに、その節で分けたものに色を付けます。

![今の形。AppModule の中の MembersController・PaymentsController・SettlementController が、それぞれ受け取って返すことに加えて、DB を開くことと SQL を持っている。SettlementController は清算も持っている](./images/02-before.svg)

最初は DB です。コントローラーが自分で `openDatabase()` を呼ぶのをやめ、NestJS に **プロバイダー** として渡してもらいます。DB はどの機能からも使うものなので、`DatabaseModule` という **モジュール** にまとめます。

![DB を開く処理が DatabaseModule の DatabaseSync に分かれ、3 つのコントローラーに注入される](./images/03-structure.svg)

```bash
npx nest g module database
```

```text
CREATE src/database/database.module.ts (85 bytes)
UPDATE src/app.module.ts (634 bytes)
```

`nest g module` は、`AppModule` の `imports` に `DatabaseModule` を足します。

::diff{file="apps/api/src/app.module.ts" by="command"}

`src/database.ts` を、できた `src/database/` フォルダに移します（中身は変えません）。

::diff{file="apps/api/src/database/database.module.ts" base="generated"}

- `{ provide: DatabaseSync, useFactory: openDatabase }` … 「`DatabaseSync` を受け取りたいクラスには、`openDatabase()` が返したものを渡す」という登録です。NestJS は `openDatabase()` を 1 回だけ呼び、同じ DB を使い回します
- `exports: [DatabaseSync]` … `DatabaseModule` を読み込んだモジュール（ここでは `AppModule`）でも、`DatabaseSync` を受け取れるようにします

::diff{file="apps/api/src/members/members.controller.ts"}

::diff{file="apps/api/src/payments/payments.controller.ts"}

::diff{file="apps/api/src/settlement/settlement.controller.ts"}

- `constructor(private readonly db: DatabaseSync)` … 引数の型を見て、NestJS が `DatabaseModule` で登録した DB を渡します（02 章で見た `AppService` と同じ依存性の注入です）

## 動作確認する

05 章の結合テストを動かします。テストのコードは変えていません。

```bash
npm run test:e2e
```

```text
 Test Files  1 passed (1)
      Tests  3 passed (3)
```

3 つとも通れば大丈夫です。書き換えても、HTTP で呼んだときの動きは変わっていません。

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [NestJS: CLI command reference](https://docs.nestjs.com/cli/usages) … `nest generate module`
- [NestJS: Custom providers](https://docs.nestjs.com/fundamentals/custom-providers) … `provide` と `useFactory`
- [NestJS: Modules](https://docs.nestjs.com/modules) … `exports` でプロバイダーをほかのモジュールに渡す（Shared modules）

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::
