---
docs: true
title: NestJS のテスト ハンズオン
---

# NestJS のテスト ハンズオン

割り勘のアプリ（NestJS の API と SQLite、画面は HTML 1 枚）に、**単体テスト・結合テスト・E2E テスト** を書いていくハンズオンです。

- **単体テスト** — Vitest。清算の計算の関数と、サービスを 1 つずつ確かめる
- **結合テスト** — Vitest と supertest。アプリを丸ごと組み立てて HTTP で呼び、DB まで確かめる
- **E2E テスト** — Playwright。Podman で動かした画面をブラウザで操作して、画面から DB までをまとめて確かめる

テストする題材の割り勘のアプリは ZIP で配ります。ほかのハンズオンを終えていなくても始められます。必要なのは Node.js・VS Code・Podman です。

## このハンズオンで作るもの

![ユーザー（画面）→ コントローラー → ロジック → DB の 4 つが横に並ぶ。単体テストはロジックだけを、結合テストはコントローラー・ロジック・DB を、E2E テストはユーザーから DB までの全部を、入れ子の枠で囲む](./sections/03-test-types/01-test-types/images/01-test-types.svg)

:::notice
これはアプリの機能のイメージをつかむためのものです。実際のアプリは API と DB を使います（02 章で動かします）。
:::

::preview[割り勘のアプリのデモ。メンバーを足し、立て替えを記録すると、清算が出ます]{src="02-project/01-start" demo="warikan" height="760"}

### 01. 準備

Node.js 26・VS Code・Podman を入れます。

### 02. プロジェクトの起動

割り勘のアプリを Podman で動かして使い、画面から DB までのリクエストの流れを見ます。

### 03. テストの種類

単体テスト・結合テスト・E2E テストが、アプリのどこからどこまでを確かめるかを見ます。

### 04. 単体テスト

清算の計算の関数（`split`・`balances`・`settle`）のテストケースを表にして設計し、Vitest で 1 つずつ書いていきます。

### 05. 結合テスト

HTTP で呼んで DB まで書き込むテストを設計し、表の中身と清算の結果を確かめるテストを書きます。

### 06. E2E テスト

3 人の割り勘のユースケースを画面の操作で設計し、Playwright で清算が出るところまで確かめます。

### 07. DI コンテナ

NestJS の DI コンテナで DB・リポジトリ・サービスを切り出します。サービスに切り出すと、これまで結合テストでしか確かめられなかったことが、アプリも DB も実際に起動しなくても確かめられるようになります。

## 進め方

- 02 章で受け取る割り勘のアプリに、1 つのフォルダ（たとえば `~/handson/warikan/`）で節ごとにテストを足していきます。
- ファイルを書き換える手順は、前の節との差分で示します。行頭が `+` の行を足し、`-` の行を消します。新しく作るファイルは、すべての行に `+` が付きます。見出しが「`ファイル` を作成する／変更する」のところは自分で書く手順で、「`ファイル` が作られる／変わる」のところは、直前のコマンドがした変更です。
- 各節のページの最後に、その節を終えたときのディレクトリと、その状態のプロジェクトの ZIP があります。途中の節から始めるときは、ひとつ前の節の ZIP を展開し、`api/` で `npm install` を実行します。画面と API は `podman compose up -d --build --wait` で動かします。

前提:

- macOS 14 以降 / Windows 11（PowerShell 7）/ Linux のどれか
- ターミナルの基本的な操作（`cd`・`ls`）ができる
- JavaScript か TypeScript を書いたことがある（NestJS は、はじめてでも進められます）

## 関連するハンズオン

NestJS のハンズオンは 3 本に分かれていて、どれから始めても進められます。Cognito と Entra ID のハンズオンも関連しています。つながりは [関連するハンズオン](./sections/RELATED.md) にまとめています。

- [NestJS で作る REST API](https://github.com/seekseep/nestjs-rest-api-handson)
- [NestJS と Cognito で認証と認可](https://github.com/seekseep/nestjs-cognito-auth-handson)
- NestJS のテスト（このハンズオン）
- [Cognito と Entra ID をローカルで練習する](https://github.com/seekseep/cognito-entra-id-emulation-handson)

## ドキュメントサイト

各節の解説は GitHub Pages で読めます: <https://seekseep.github.io/nestjs-testing-handson/>

## ライセンス・注意事項

- 学習用リポジトリです
