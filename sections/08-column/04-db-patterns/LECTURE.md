---
docs: true
title: データベースの処理のパターン
---

# データベースの処理のパターン

![コラム データベースの処理のパターン。同じ DB に、直接書く・アクティブレコード・リポジトリ・ORM の 4 つの形が、SQL・save()・findAll()・対応づけでつながる](./images/00-thumbnail.svg)

SQL はどこに書くのがよいのか、迷ったことはありませんか。DB の読み書きを書く場所の、よく使われる 4 つのパターンと、テストのしやすさのちがいを見ます。

## DB の読み書きをどこに書くか

DB を読み書きするコードを、どこに書くか。これで、テストのしやすさが大きく変わります。コントローラーの中に SQL を書けば、コントローラーを確かめるには DB が要ります。DB を扱うところを 1 か所に分けて受け取る形にすれば、そこだけを偽物に差し替えられます。

よく使われる形を 4 つ比べます。

## 4 つのパターン

| パターン | 形 | 例 | 偽物への差し替え |
|---|---|---|---|
| 直接書く | 処理の中に SQL をそのまま書く | 本編の 04〜06 章のコントローラー | できない。確かめるには DB が要る |
| アクティブレコード | データのクラス自身が `save()`・`find()` を持ち、自分を DB に書く | Rails の Active Record、TypeORM の Active Record | しにくい。データと DB が離せない |
| リポジトリ | 集まりのように扱う入口（`findAll()`・`create()`）を作り、その中で DB を読み書きする | 本編の 07 章の `PaymentsRepository` | しやすい。入口ごと差し替える |
| ORM（データマッパー） | オブジェクトと表の対応を ORM が受け持ち、データのクラスは DB を知らない | Prisma、TypeORM の Data Mapper | リポジトリと組み合わせれば差し替えられる |

アクティブレコードは、少ないコードで書けるのが強みです。その代わり、データのクラスが DB とつながっているので、DB 無しで確かめにくくなります。データマッパーは、データのクラスを DB から切り離せます。

## 本編とのつながり

本編の [04〜06 章](../../02-project/02-request-flow/LECTURE.md) は、コントローラーに SQL を直接書く形でした。そのため、清算を出すところは、05 章の結合テストでしか確かめられませんでした。

[07 章](../../07-di-container/02-repository/LECTURE.md) で SQL をリポジトリに分け、[サービスに注入する](../../07-di-container/03-service/LECTURE.md) 形にしたので、[サービスの単体テスト](../../07-di-container/04-service-test/LECTURE.md) でリポジトリを偽物に差し替えられるようになりました。

## 詳しく知りたい人へ

4 つのパターンのうち 3 つは、Martin Fowler の『Patterns of Enterprise Application Architecture』に名前が付いています。

## 参考

- [Martin Fowler: Active Record](https://martinfowler.com/eaaCatalog/activeRecord.html)
- [Martin Fowler: Repository](https://martinfowler.com/eaaCatalog/repository.html)
- [Martin Fowler: Data Mapper](https://martinfowler.com/eaaCatalog/dataMapper.html)
- [TypeORM: Active Record vs Data Mapper](https://typeorm.io/active-record-data-mapper) … 1 つの ORM で 2 つの書き方を選べる例
- [Rails Guides: Active Record Basics](https://guides.rubyonrails.org/active_record_basics.html)
- [Prisma: What is Prisma ORM?](https://www.prisma.io/docs/orm/overview/introduction/what-is-prisma)
