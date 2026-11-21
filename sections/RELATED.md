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
| [NestJS と Cognito で認証と認可](https://seekseep.github.io/nestjs-cognito-auth-handson/) | ノートの API に、Amazon Cognito のトークンでの認証と、作った人だけが削除できる認可を足す | Node.js・Podman・VS Code |
| NestJS のテスト（このハンズオン） | ノートの API に、単体テスト・結合テスト・E2E テストを書く | Node.js・VS Code |
| [Cognito と Entra ID をローカルで練習する](https://seekseep.github.io/cognito-entra-id-emulation-handson/) | Cognito のユーザープールを作り、素の HTML からログインして、Cognito 経由で Entra ID にもログインする | Podman・aws CLI・jq |

## つながり

- **REST API → 認証と認可:** REST API で学ぶコントローラー・サービス・モジュールの分け方を、認証と認可でもそのまま使います。
- **認証と認可 → テスト:** テストで配る「はじめのプロジェクト」は、認証と認可の最後の節と同じ形（ノートの作成・一覧・削除、トークンの確認、作った人だけが削除できる）です。
- **REST API → テスト:** テストで学ぶ書き方は、REST API で作ったサービスやコントローラーにもそのまま使えます。
- **認証と認可 ↔ Cognito と Entra ID:** どちらも Cognito に Floci を使い、画面は `fetch` で Cognito を直接呼ぶ素の HTML です。Entra ID でログインしても、アプリが受け取るのは Cognito のトークンなので、認証と認可で作った API の側は変えずに済みます。
