# 引き継ぎメモ（2026-11-20）

## 状況

- 元の `seekseep/nest-js-and-cognito-handson`（Next.js + NestJS + Cognito + Podman の 1 本のハンズオン）を、3 本の独立したハンズオンに分けた
  - A: 基本的な REST API（元のリポジトリを作り変え、`nestjs-rest-api-handson` に改名する予定）
  - B: Cognito で認証と認可（`seekseep/nestjs-cognito-auth-handson`）
  - C: テスト（このリポジトリ）
- サイトの仕組み（`site/`・`tools/`・`.github/workflows/deploy-docs.yml`）は、元のリポジトリの main からそのまま持ってきた
- 教材は元の `sections/10-testing/` の 3 節をもとに、最小構成（NestJS 1 つ＋ HTML 1 枚）に書き直した
- 2026-11-20: 01〜05 章をすべてマージ済み（#2〜#6）。GitHub Pages へのデプロイも成功している（https://seekseep.github.io/nestjs-testing-handson/）
- 進み具合と残り（A の改名後のリンク確認）はイシュー #1 を見る

## 環境

- Node.js 26（nvm。シェルの既定が 24 のことがあるので `nvm use 26` か PATH で 26 を使う）、pnpm は `site/package.json` の packageManager に従う
- Playwright のブラウザは `npx playwright install chromium` で入れる（`~/Library/Caches/ms-playwright/`）

## 決まっている設計

- 各節のディレクトリ = その節を終えた時点のプロジェクト（`api/` だけ。NestJS 12、ESM、Vitest、oxlint）
- 次の節は `tools/copy-lecture.sh <前の節> <次の節>` でコピーしてから差分を足す
- 画面は `api/public/index.html` を `app.useStaticAssets()` で配る（同じオリジンなので CORS は要らない）。ポートは 3000
- 入力チェックは Zod + `StandardSchemaValidationPipe`（`@Body({ schema })`。グローバルの Pipe は `main.ts`、04 章から `app.setup.ts`）
- 認証は `AuthGuard`（`@UseGuards()` でメモのコントローラーに掛ける）。トークンの検証は `TokenVerifier` に切り出し、本物は aws-jwt-verify で Cognito を見る
  - `COGNITO_USER_POOL_ID`・`COGNITO_CLIENT_ID` が無いときは、起動はできて、警告を出し、どのトークンも 401
  - `api/.env` があれば `main.ts` が `process.loadEnvFile()` で読む
- 認可は `NotesService` の中（持ち主でなければ 403、`admin` グループは全員分）
- テストでの認証は「トークンの直書き」: `FakeTokenVerifier`（`alice-token`・`bob-token`・`admin-token`）
  - 結合テスト（04 章）: `overrideProvider(TokenVerifier).useClass(FakeTokenVerifier)`
  - E2E テスト（05 章）: `USE_FAKE_AUTH=true` で `AuthModule` が偽物を使う。画面は `sessionStorage` の `token` を読むので、Playwright の `page.addInitScript()` で入れる
  - 本来の方法（テスト用ユーザーでのサインイン、setup project と storageState など）には触れない、と本文に書く（ユーザーの指示）
- 結合テストのファイルは `test/*.integration-spec.ts`（NestJS の「e2e」は、このハンズオンでは結合テストと呼ぶ）
- E2E テストは `api/e2e/`、`api/playwright.config.ts`。Vitest が拾わないように `vitest.config.ts` の `include` を `src/` に絞る

## 作っていて分かったこと

- Playwright の System requirements が Windows 11+・macOS 14+ なので、前提を Windows 11 にした
- AI エージェントの中で Vitest を動かすと、エージェントを見分けて `skipFull` を付け、カバレッジの表から 100% のファイルを隠す・`console.log` を出さない。本文の出力例は `env -i PATH=... HOME=...` で環境変数を外して取った
- Nest の TestingModule の既定のロガーはエラーしか出さないので、結合テストで `FakeTokenVerifier` の WARN は出ない
- `AuthModule` の `USE_FAKE_AUTH` はファイルが読み込まれたときに決まるので、`main.ts` が読む `.env` に書いても効かない（05-01 の FAQ）
- npm 11.12 の `npm install` は `npm warn install-scripts`（fsevents）を出す（02-01 の FAQ）

## 確かめ方のメモ

- 各節の `api/` で `npm install` → `npm run build`・`npm run lint`・`npm test`（04 章から `npm run test:integration`、05 章から `npm run test:e2e`）
- 偽物の認証に切り替えていない起動では、`alice-token` が 401 になる
- サイト: `cd site && pnpm install && pnpm run build`
