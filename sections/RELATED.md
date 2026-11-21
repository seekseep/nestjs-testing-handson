---
docs: true
title: 関連するハンズオン
sidebar:
  label: 関連するハンズオン
  order: 4
---

# 関連するハンズオン

NestJS のハンズオンは 3 本に分かれています。Cognito と Entra ID のハンズオンも関連しています。それぞれ別のプロジェクトを最初から作るので、どれから始めても進められます。

| ハンズオン | すること | 使うもの |
|---|---|---|
| [NestJS で作る REST API](https://seekseep.github.io/nestjs-rest-api-handson/) | OpenAPI で API を設計し、そのとおりにメモの作成・取得・一覧・更新・削除を NestJS で実装して、NestJS の形（モジュール・サービス・DTO）に整理する | Node.js・VS Code |
| [NestJS と Cognito で認証と認可](https://seekseep.github.io/nestjs-cognito-auth-handson/) | ノートの API（NestJS と SQLite）を表と図で設計して実装し、Amazon Cognito のトークンでの認証と、所有・役割・所属での認可を足して、権限を API で確かめるかトークンに持たせるかを比べる | Node.js・Podman・VS Code |
| NestJS のテスト（このハンズオン） | 割り勘のアプリ（NestJS と SQLite）に、単体テスト・結合テスト・E2E テストを書き、DI で単体テストしやすい形に直す | Node.js・Podman・VS Code |
| [Cognito と Entra ID をローカルで練習する](https://seekseep.github.io/cognito-entra-id-emulation-handson/) | Cognito のユーザープールを作り、素の HTML からログインして、Cognito 経由で Entra ID にもログインする | Podman・aws CLI・jq |

## つながり

- **REST API → 認証と認可:** 認証と認可は、REST API と同じ書き方で進めます。ノートは同じ SQLite（`node:sqlite`）に入れ、まずコントローラーに直接書いてから、`DatabaseModule`・サービスの順に分けます。
- **REST API → テスト:** テストで配る割り勘のアプリは、REST API と同じく SQLite（`node:sqlite`）を使います。テストの 06 章では、REST API の 05 章と同じように DB を `DatabaseModule` に分け、サービスに分けてから、偽物を渡して単体テストします。
- **認証と認可 ↔ Cognito と Entra ID:** どちらも Cognito に Floci を使い、画面は `fetch` で Cognito を直接呼ぶ素の HTML です。Entra ID でログインしても、アプリが受け取るのは Cognito のトークンなので、認証と認可で作った API の側は変えずに済みます。
