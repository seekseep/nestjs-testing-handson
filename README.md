---
docs: true
title: NestJS のテスト ハンズオン
---

# NestJS のテスト ハンズオン

割り勘のアプリ（NestJS の API と SQLite、画面は HTML 1 枚）に、**単体テスト・結合テスト・E2E テスト** を書いていくハンズオンです。

- **単体テスト** — Vitest。清算の計算の関数と、サービスを 1 つずつ確かめる
- **結合テスト** — Vitest と supertest。アプリを丸ごと組み立てて HTTP で呼び、DB まで確かめる
- **E2E テスト** — Playwright。Podman で動かした画面をブラウザで操作して、画面から DB までをまとめて確かめる

テストする題材の割り勘のアプリは ZIP で配ります。ほかのハンズオンを終えていなくても始められます。

## このハンズオンで作るもの

![アプリは画面・エンドポイント・ロジック・DB の 4 つでできている。単体テスト（03 章）はロジックの計算の関数だけを確かめる。結合テスト（04 章）はテストのコードから HTTP でエンドポイント・ロジック・DB をまとめて確かめ、DB は一時ファイルにする。E2E テスト（05 章）は Podman で動かした画面から DB までをブラウザで確かめる。もっと単体テスト（06 章）は、リポジトリを偽物にしてサービスを確かめる](./sections/03-unit-test/01-settle/images/01-test-types.svg)

| 章 | やること |
|---|---|
| 01. 準備 | Node.js 26・VS Code・Podman を入れる |
| 02. プロジェクトの起動 | 割り勘のアプリを Podman で動かして使い、画面から DB までのリクエストの流れを見る |
| 03. 単体テスト | 清算の計算の関数（`split`・`balances`・`settle`）をテストする |
| 04. 結合テスト | HTTP で呼んで DB まで書き込み、表の中身と清算の結果を確かめる |
| 05. E2E テスト | Playwright で画面にメンバーと立て替えを入れ、清算が出ることを確かめる |
| 06. もっと単体テスト | DI を使う形に書き換え、偽物のリポジトリでサービスを単体テストする |

## 進め方

- 02 章で受け取る割り勘のアプリに、1 つのフォルダ（たとえば `~/handson/warikan/`）で節ごとにテストを足していきます。
- ファイルを書き換える手順は、前の節との差分で示します。行頭が `+` の行を足し、`-` の行を消します。新しく作るファイルは、すべての行に `+` が付きます。見出しが「`ファイル` を作成する／変更する」のところは自分で書く手順です。
- 各節のページの最後に、その節を終えたときのディレクトリと、その状態のプロジェクトの ZIP があります。途中の節から始めるときは、ひとつ前の節の ZIP を展開し、`api/` で `npm install` を実行します。画面と API は `podman compose up -d --build --wait` で動かします。

前提:

- macOS 14 以降 / Windows 11（PowerShell 7）/ Linux（Ubuntu 22.04 以降）のどれか
- ターミナルの基本的な操作（`cd`・`ls`）ができる
- JavaScript か TypeScript を書いたことがある（NestJS は、はじめてでも進められます）

## 関連するハンズオン

NestJS のハンズオンは 3 本に分かれていて、どれから始めても進められます。Cognito と Entra ID のハンズオンも関連しています。つながりは [関連するハンズオン](./sections/RELATED.md) にまとめています。

- [NestJS で作る REST API](https://github.com/seekseep/nestjs-rest-api-handson)
- [NestJS と Cognito で認証と認可](https://github.com/seekseep/nestjs-cognito-auth-handson)
- NestJS のテスト（このハンズオン）
- [Cognito と Entra ID をローカルで練習する](https://github.com/seekseep/cognito-entra-id-emulation-handson)

## ドキュメントサイト

<https://seekseep.github.io/nestjs-testing-handson/>

## 注意事項

- 学習用リポジトリです
