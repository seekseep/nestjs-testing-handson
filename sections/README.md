---
docs: true
title: 進め方
sidebar:
  label: 進め方
  order: 0
---

# 進め方

## 1 つのプロジェクトにテストを足していく

このハンズオンでは、02 章で受け取る「はじめのプロジェクト」に、節ごとにテストを足していきます。リポジトリの `sections/<章>/<節>/` には、**その節を終えた時点のプロジェクト** がそのまま入っています。

```text
sections/
├── 02-starter/
│   └── 01-starter-project/      ← はじめのプロジェクト
├── 03-unit-test/
│   ├── 01-functions-services/   ← 03 章 01 節を終えた時点
│   └── 02-mock-coverage/        ← 03 章 02 節を終えた時点
├── ...
```

手元では 1 つのフォルダ（たとえば `~/handson/notes-app/`）を育てていきます。各節のページの手順どおりにファイルを足したり書き換えたりしてください。

## ページの読み方

### コードの差分

ファイルを書き換える手順は、前の節との差分で示します。行頭が `+` の行を足し、`-` の行を消します。新しく作るファイルは、すべての行に `+` が付きます。

```diff lang="ts"
 async function bootstrap() {
   const app = await NestFactory.create(AppModule);
-  app.useGlobalPipes(new StandardSchemaValidationPipe());
+  setupApp(app);
   await app.listen(process.env.PORT ?? 3000);
 }
```

左の行番号は「書き換える前の行」、右の行番号は「書き換えた後の行」です。

### この節を終えたときのディレクトリ

ページの最後に、その節を終えたときのディレクトリを載せています。前の節から **追加したファイル** と **変更したファイル** には印が付いています。手元のディレクトリと見比べてください。

その下のボタンから、その節を終えた状態のプロジェクトを ZIP でダウンロードできます。

- 途中の節から始めたいときは、ひとつ前の節の ZIP をダウンロードして展開してください
- 展開したら、`api/` で `npm install` を実行します（`node_modules/` は ZIP に入っていません）

## 前提

- macOS / Windows 10・11（PowerShell 7）/ Linux のどれか。Windows に必要なスペックは [準備](./01-setup/01-environment/LECTURE.md) の節にあります
- ターミナルの基本的な操作（`cd`・`ls`）ができる
- JavaScript か TypeScript を書いたことがある
- NestJS は、はじめてでも進められます。コントローラー・サービス・モジュールといった言葉は、02 章でざっと説明します
- AWS のアカウントは要りません

## 使うもの

| 道具 | 役割 | 入れる節 |
|---|---|---|
| Node.js 26（LTS） | NestJS とテストを動かす | 01 章 |
| VS Code | エディタ | 01 章・[開発ツール](./TOOLS.md) |
| Vitest | 単体テスト・結合テスト | はじめのプロジェクトに入っている |
| supertest | 結合テストで HTTP のリクエストを送る | はじめのプロジェクトに入っている |
| Playwright | E2E テストでブラウザを動かす | 05 章 |
