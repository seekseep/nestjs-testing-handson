---
docs: true
title: 開発ツール（VS Code / ブラウザ）
sidebar:
  label: 開発ツール
  order: 3
---

# 開発ツール（VS Code / ブラウザ）

ハンズオンを進めるうえで使うエディタとブラウザについてまとめます。

## VS Code

エディタには [Visual Studio Code](https://code.visualstudio.com/) を使います。入れ方は [準備](./01-setup/01-environment/LECTURE.md) の節にあります。

### プロジェクトを開く

育てているプロジェクトのフォルダで次を実行するか、VS Code の **ファイル → フォルダーを開く** から開きます。

```bash
code .
```

### ターミナルを開く

`` Ctrl + ` ``（バッククォート）でエディタの中にターミナルが開きます。API を動かしたままテストを動かしたいときは、ターミナルを 2 つ開いて（右上の **＋**）使い分けます。

### 入れておくと便利な拡張機能

| 拡張機能 | 用途 |
|---|---|
| Vitest | エディタの「テスト」の画面から、Vitest のテストを 1 つずつ動かせる |
| Playwright Test for VSCode | Playwright のテストを動かしたり、操作を記録してテストを作ったりできる |
| Prettier | NestJS のプロジェクトに入っている Prettier で整形する |
| oxc | NestJS のプロジェクトに入っている oxlint の指摘をエディタに出す |

どれも、テストやコマンドを動かすだけなら要りません。このハンズオンの手順は、すべてターミナルのコマンドで書いています。

## ブラウザの開発者ツール

画面の動きを確かめるときは、ブラウザの開発者ツール（DevTools）を使います。Chrome / Edge / Firefox のどれでも `F12` か、右クリック → 「検証」で開けます。

- **Network タブ** — API へのリクエストとレスポンス、ステータスコード、`Authorization` ヘッダーを確かめる
- **Console タブ** — エラーやログを確かめる
- **Application タブ**（Chrome）— 画面が保存したトークン（Session Storage）を確かめる
