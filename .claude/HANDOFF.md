# 引き継ぎメモ（2026-11-20）

## 状況

- 元の `seekseep/nest-js-and-cognito-handson`（Next.js + NestJS + Cognito + Podman の 1 本のハンズオン）を、3 本の独立したハンズオンに分けた
  - A: 基本的な REST API（元のリポジトリを作り変え、`nestjs-rest-api-handson` に改名する予定）
  - B: Cognito で認証と認可（`seekseep/nestjs-cognito-auth-handson`）
  - C: テスト（このリポジトリ）
- サイトの仕組み（`site/`・`tools/`・`.github/workflows/deploy-docs.yml`）は、元のリポジトリの main からそのまま持ってきた
- 教材は元の `sections/10-testing/` の 3 節をもとに、最小構成（NestJS 1 つ＋ HTML 1 枚）に書き直した
- 2026-11-20: 01〜05 章（当時の章立て）をすべてマージ済み（#2〜#6）。GitHub Pages へのデプロイも成功している（https://seekseep.github.io/nestjs-testing-handson/）
- 本文を重要な要素だけに絞り、各節の `api/` を最小構成にした（#8、#9）
- 題材を B（`nestjs-cognito-auth-handson` の `05-refactor/01-auth-middleware`）と同じ形（ノートの作成・一覧・削除、`AuthMiddleware`）に作り直した
- 2026-11-21: 02 章「はじめのプロジェクト」を 01 章「準備」に入れ（`01-setup/02-starter-project`）、単体・結合・E2E を 02〜04 章に繰り上げた
- 2026-11-21: プロジェクトだけの 02 章を作り、起動する（`02-project/01-start`）とリクエストの流れ（`02-project/02-request-flow`）に分けた。単体・結合・E2E は 03〜05 章
- 2026-11-21: 題材を割り勘のアプリ（認証なし、SQLite、Podman で api と web）に作り直し、章立てを 01 準備・02 プロジェクトの起動・03 単体・04 結合・05 E2E・06 もっと単体テストにした
- 2026-11-21: A の新しい書き方を入れた。配る `api/` を `nest new` の出力そのままにアプリのコードを足した形にし（Vitest・supertest は入れ直さない）、03〜05 章を「設計 → 書く → 足す」の 3 節に分け、02-02 の流れの図を処理ごとの 3 枚に分け、06 章を `DatabaseModule` から始めて節ごとの構成図を足した
- 進み具合と残りはイシュー #1 を見る

## 環境

- Node.js 26、pnpm は `site/package.json` の packageManager に従う
- Playwright のブラウザは `npx playwright install chromium` で入れる（`~/Library/Caches/ms-playwright/`）

## 決まっている設計

- `.claude/AGENTS.md` の「プロジェクトの形」を見る
- テストの件数: 単体 2（03-02）→ 10（03-03 から）→ 13（06-04）、結合 1（04-02）→ 3（04-03 から。06 章の各節でも 3 のまま通る）、E2E 1（05-02 はメンバーを足すだけ、05-03 から清算まで）

## 作っていて分かったこと

- Playwright の System requirements が Windows 11+・macOS 14+ なので、前提を Windows 11 にした
- AI エージェントの中で Vitest を動かすと、エージェントを見分けて出力を変える。本文の出力例は `env -i PATH=... HOME=...` で環境変数を外して取った
- `node:sqlite` の `.all()` の結果は `interface` には `as` で渡せない（`type` なら渡せる）
- `podman compose up --wait` は、healthcheck の無いコンテナも起動したら `Healthy` と出す
- `nest new --skip-tests` でも、Vitest・`@nestjs/testing`・supertest と `vitest.config.ts`・`vitest.config.e2e.ts`・test の scripts は入る（公式ドキュメントの説明と違う。実際に作って確かめた）
- `package.json` に `@nestjs/testing` があると、`nest g service` は spec のひな形も作る。06-03 は `--no-spec` で作らない
- E2E で一覧の数だけを `toHaveCount(1)` で待つと、前のデータの 1 人で通ってしまうことがある。最初に API でデータが空か確かめる
- genfig は `~/.claude/skills/genfig` に無い環境がある。`gh repo clone seekseep/genfig-skill` して `PYTHONPATH` に渡せば同じ SVG ができる（A の図で一致を確かめた）

## 確かめ方のメモ

- 各節の `api/` で `npm install` → `npm run build`、03-02 から `npm test`、04-02 から `npm run test:e2e`（結合テスト）、05-02 から `podman compose down --volumes` → `podman compose up -d --build --wait` → `npx playwright test`
- サイト: `cd site && pnpm install && pnpm run build`
