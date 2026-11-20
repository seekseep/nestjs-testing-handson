---
docs: true
title: 進め方
sidebar:
  label: 進め方
  order: 0
---

# 進め方

## 1 つのプロジェクトにテストを足していく

02 章で受け取る「はじめのプロジェクト」に、節ごとにテストを足していきます。手元では 1 つのフォルダ（たとえば `~/handson/notes-app/`）を育て、各節のページの手順どおりにファイルを足したり書き換えたりします。

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

### この節を終えたときのディレクトリ

ページの最後に、その節を終えたときのプロジェクトを載せています。前の節から追加・変更したファイルには印が付いています。

その下のボタンから、その節を終えた状態のプロジェクトを ZIP でダウンロードできます。途中の節から始めたいときは、ひとつ前の節の ZIP を展開し、`api/` で `npm install` を実行してください。

## 前提

- macOS 14 以降 / Windows 11（PowerShell 7）/ Linux（Ubuntu 22.04 以降）のどれか
- ターミナルの基本的な操作（`cd`・`ls`）ができる
- JavaScript か TypeScript を書いたことがある（NestJS は、はじめてでも進められます）
- AWS のアカウントは要りません
