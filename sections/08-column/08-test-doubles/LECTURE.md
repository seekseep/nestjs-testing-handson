---
docs: true
title: テストダブルの種類
---

# テストダブルの種類

![コラム テストダブルの種類。本物の代わりに渡す 5 つの偽物](./images/00-thumbnail.svg)

「モック」と「スタブ」は何がちがうのか、気になったことはありませんか。本物の代わりに渡すもの（テストダブル）の種類を見ます。

## スタブ・モック・フェイク・スパイ・ダミー

テストで本物の代わりに渡すものを、まとめて **テストダブル** と呼びます。映画のスタントの代役（stunt double）から来た名前です。役目によって、5 つに分けられます。

| 種類 | すること | 割り勘のアプリでの例 |
|---|---|---|
| ダミー | 渡すだけで、使われない | 引数の数を合わせるためだけに渡す空のオブジェクト |
| スタブ | 決まった値を返す | `findAll()` がいつも同じ立て替えを返すリポジトリ |
| スパイ | 呼ばれ方を残す（決まった値も返せる） | `findAll()` が何回呼ばれたかを数えておくリポジトリ |
| モック | どう呼ばれるべきかを先に決めておき、そのとおりに呼ばれたかを確かめる | `findAll()` が 1 回だけ呼ばれることを確かめるリポジトリ |
| フェイク | 本番では使えないが、動く簡単な本物 | 配列に立て替えをためて読み書きする、メモリ上のリポジトリ |

Vitest の `vi.fn()` は、呼ばれ方を残すスパイとして使え、`mockReturnValue()` で決まった値を返すスタブにもなります。

## このハンズオンで使ったもの

[07 章のサービスのテスト](../../07-di-container/04-service-test/LECTURE.md) で使った `fakeRepository(payments)` は、`findAll()` が決まった立て替えを返すだけです。名前は「偽物」（fake）ですが、役目はスタブに当たります。

```ts
/** DB の代わりに、決まった立て替えを返す偽物のリポジトリを作る。 */
function fakeRepository(payments: Payment[]) {
  return { findAll: () => payments } as PaymentsRepository;
}
```

## 使い分け

結果を確かめたいときは、スタブかフェイクを使い、返ってきた値を確かめます。本編のテストは、どれもこの形です。

呼び出しそのものが大事なとき（メールを 1 通だけ送る、外の API に決まった形で送る、など）にだけ、モックやスパイで呼ばれ方を確かめます。呼ばれ方を確かめるテストは、作り方を変えると落ちやすいので、使いどころを絞ります（[ロンドン学派と古典学派](../02-london-classic/LECTURE.md) の実験）。

## 参考

- [Martin Fowler: TestDouble](https://martinfowler.com/bliki/TestDouble.html) … ダミー・フェイク・スタブ・スパイ・モックの 5 つ
- [xUnit Test Patterns: Test Double](http://xunitpatterns.com/Test%20Double.html) … テストダブルという名前と、その分け方の出どころ
- [Martin Fowler: Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html) … 状態を確かめるスタブと、振る舞いを確かめるモックのちがい
- [Vitest: vi](https://vitest.dev/api/vi) … `vi.fn()` と `mockReturnValue()`
