# 引き継ぎメモ（2026-11-20）

## 状況

- 元の `seekseep/nest-js-and-cognito-handson`（Next.js + NestJS + Cognito + Podman の 1 本のハンズオン）を、3 本の独立したハンズオンに分けた
  - A: 基本的な REST API（元のリポジトリを作り変え、`nestjs-rest-api-handson` に改名する予定）
  - B: Cognito で認証と認可（`seekseep/nestjs-cognito-auth-handson`）
  - C: テスト（このリポジトリ）
- サイトの仕組み（`site/`・`tools/`・`.github/workflows/deploy-docs.yml`）は、元のリポジトリの main からそのまま持ってきた
- 教材は元の `sections/10-testing/` の 3 節をもとに、最小構成（NestJS 1 つ＋ HTML 1 枚）に書き直した
- 2026-11-20: 01〜05 章をすべてマージ済み（#2〜#6）。GitHub Pages へのデプロイも成功している（https://seekseep.github.io/nestjs-testing-handson/）
- 本文を重要な要素だけに絞り、各節の `api/` を最小構成にした（#8、#9）
- 題材を B（`nestjs-cognito-auth-handson` の `05-refactor/01-auth-middleware`）と同じ形（ノートの作成・一覧・削除、`AuthMiddleware`）に作り直した
- 進み具合と残りはイシュー #1 を見る

## 環境

- Node.js 26、pnpm は `site/package.json` の packageManager に従う
- Playwright のブラウザは `npx playwright install chromium` で入れる（`~/Library/Caches/ms-playwright/`）

## 決まっている設計

- 各節のディレクトリ = その節を終えた時点のプロジェクト（`api/` だけ。NestJS 12、ESM）。ファイルは最小限（lint・format・`.env` は無い）
- 次の節は `tools/copy-lecture.sh <前の節> <次の節>` でコピーしてから差分を足す
- 題材は B の最後の節と同じ形: `POST /notes`（トークン要る）・`GET /notes`（誰でも）・`DELETE /notes/:id`（作った人だけ。403 / 404）。ノートは `{ id, text, ownerId }`
- 画面は一覧の `api/public/notes.html`（`/notes.html`）だけ。`app.useStaticAssets()` で配る。ポートは 3000
- 認証は `AuthMiddleware`（`AppModule.configure()` の `forRoutes()` で POST と DELETE にだけ掛ける）。トークンの検証は DI で受け取る `TokenVerifier` に切り出し、本物は aws-jwt-verify の `CognitoJwtVerifier`（B の Floci 向けの `JwtVerifier` は使わない）
  - `COGNITO_USER_POOL_ID`・`COGNITO_CLIENT_ID` が無いときは、起動はできて、警告を出し、どのトークンも 401
- テストの道具は節ごとに入れる: Vitest（03-01）、`@vitest/coverage-v8`（03-02）、`@nestjs/testing`・supertest（04）、Playwright（05）
- テストでの認証は「トークンの直書き」: `FakeTokenVerifier`（`alice-token`・`bob-token`）
  - 結合テスト（04 章）: `overrideProvider(TokenVerifier).useClass(FakeTokenVerifier)`
  - E2E テスト（05 章）: `USE_FAKE_AUTH=true` で `AppModule` が偽物を使う。Playwright の `request` にトークンを付けて作成・削除し、一覧の画面への反映を見る
  - 本来の方法（テスト用ユーザーでのサインイン、setup project と storageState など）には触れない、と本文に書く（ユーザーの指示）
- テストの件数: 単体 4（03-01）→ 6（03-02 から）、結合 6、E2E 2
- 結合テストのファイルは `test/*.integration-spec.ts`（`vitest.config.integration.ts`）。単体テストは `vitest.config.ts` で `src/**/*.spec.ts` に絞る（`e2e/` の Playwright のテストを拾わない）

## 作っていて分かったこと

- Playwright の System requirements が Windows 11+・macOS 14+ なので、前提を Windows 11 にした
- AI エージェントの中で Vitest を動かすと、エージェントを見分けて `skipFull` を付け、カバレッジの表から 100% のファイルを隠す・`console.log` を出さない。本文の出力例は `env -i PATH=... HOME=...` で環境変数を外して取った
- Nest の TestingModule の既定のロガーはエラーしか出さないので、結合テストで `FakeTokenVerifier` の WARN は出ない
- `AppModule` の `USE_FAKE_AUTH` はファイルが読み込まれたときに決まる
- middleware を掛け忘れると、`req.user` が無くてコントローラーで 500 になる（04 章の「試しに」で使っている）
- npm 11.12 の `npm install` は `npm warn install-scripts` を出す（02-01 の FAQ）

## 確かめ方のメモ

- 各節の `api/` で `npm install` → `npm run build`、03 章から `npm test`、04 章から `npm run test:integration`、05 章から `npm run test:e2e`
- 偽物の認証に切り替えていない起動では、`alice-token` が 401 になる
- サイト: `cd site && pnpm install && pnpm run build`
