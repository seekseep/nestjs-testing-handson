---
docs: true
title: NestJS のテスト ハンズオン
---

# NestJS のテスト ハンズオン

NestJS で作ったメモの API に、**単体テスト・結合テスト・E2E テスト** を書いていくハンズオンです。

- **単体テスト** — Vitest。関数・サービス・Guard を 1 つずつ確かめる。相手は偽物（モック）に差し替える
- **結合テスト** — Vitest と supertest。アプリを丸ごと組み立てて、HTTP で呼んで確かめる
- **E2E テスト** — Playwright。ブラウザで画面を操作して、画面から API までをまとめて確かめる

テストする題材の「はじめのプロジェクト」（メモの API と、画面の HTML 1 枚）は ZIP で配ります。ほかのハンズオンを終えていなくても始められます。AWS のアカウントも要りません。

進め方は [進め方](./sections/README.md) を見てください。

## このハンズオンで作るもの

![3 種類のテストが確かめる範囲。単体テストは 1 つのクラスだけ、結合テストは API 全体を HTTP で、E2E テストはブラウザから画面と API をまとめて確かめる](./sections/03-unit-test/01-functions-services/images/01-test-types.svg)

| 章 | やること |
|---|---|
| 01. 準備 | Node.js 26 と VS Code を入れる |
| 02. はじめのプロジェクト | 題材のプロジェクトを受け取って動かし、ファイルの役割を見る |
| 03. 単体テスト | 関数・サービス・Guard のテストを書く。トークンの検証を `vi.fn()` の偽物に差し替える。カバレッジを見る |
| 04. 結合テスト | アプリを丸ごと組み立て、supertest で HTTP で呼ぶ。トークンの検証を決め打ちのトークンを通す偽物に差し替える |
| 05. E2E テスト | Playwright で画面を操作して、メモの追加・削除・入力エラーを確かめる |

## ほかのハンズオン

NestJS のハンズオンは 3 本に分かれていて、どれから始めても進められます。

- [基本的な REST API](https://github.com/seekseep/nestjs-rest-api-handson) … NestJS でメモの API を作る
- [Cognito で認証と認可](https://github.com/seekseep/nestjs-cognito-auth-handson) … Amazon Cognito のトークンで認証し、持ち主とグループで認可する
- NestJS のテスト（このハンズオン）

## ドキュメントサイト

<https://seekseep.github.io/nestjs-testing-handson/>

## 注意事項

- 学習用リポジトリです
- テストでは、決め打ちのトークン（`alice-token` など）で認証します。本来のテストでの認証のやり方（テスト用のユーザーでサインインするなど）には触れません
