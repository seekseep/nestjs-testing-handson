# AGENTS.md - プロジェクト方針

## プロジェクト概要

NestJS で作ったノートの API（作成・一覧・削除。B と同じ形）に、単体テスト（Vitest）・結合テスト（Vitest と supertest）・E2E テスト（Playwright）を書くハンズオン教材。
3 本に分けたハンズオンの C（A: 基本的な REST API `nestjs-rest-api-handson`、B: Cognito で認証と認可 `nestjs-cognito-auth-handson`）。
A も B も終えていなくても始められるように、02 章で「はじめのプロジェクト」を ZIP で配る。
handson-builder スキルの骨格（`sections/` ＋ Starlight の `site/` ＋ GitHub Pages）を使っている。
全体の計画と方針の正本は GitHub のイシュー #1。

## 用語：章（セクション）と節（レクチャー）

| 用語 | 指すもの | 例 |
|---|---|---|
| **章** | `sections/<NN-section>/`。章立ては固定（イシュー #1） | `03-unit-test/` |
| **節** | `sections/<NN-section>/<NN-lecture>/`。増減してよい | `03-unit-test/01-service/` |

- 節のディレクトリは **その節を終えた時点のプロジェクト** を丸ごと持つ（`api/`）
- 次の節は、前の節のディレクトリをコピーして差分を足して作る（`tools/copy-lecture.sh <前の節> <次の節>`）
- 本文は `LECTURE.md`（`docs: true`）。節の直下に `README.md` は置かない（起動方法は本文に書く）
- 説明図は `images/` に SVG で置く（`00-thumbnail.svg` を先頭サムネに。`tools/thumbnail.mjs` の THUMBNAILS に足して `node tools/thumbnail.mjs`）
- 章の直下には README を置かない
- 準備（`01-setup/01-environment`）とリクエストの流れ（`02-project/02-request-flow`）はプロジェクトを持たない（本文だけ）。はじめのプロジェクトは `02-project/01-start`

## プロジェクトの形

```text
sections/<sec>/<lec>/
├── LECTURE.md        教材本文（ZIP に入らない）
├── images/           説明図（ZIP に入らない）
└── api/              NestJS（1 つだけ）
    ├── public/notes.html   ノートの一覧の画面（app.useStaticAssets() で配る）
    ├── src/
    ├── test/         結合テスト（04 章から）
    └── e2e/          E2E テスト（05 章から。playwright.config.ts も api/ に置く）
```

- **プロジェクトのファイルは最小限**: ビルド・起動・教材のテストに要るものだけを置く。lint・format（oxlint・Prettier）、
  `.gitattributes`、`nest new` の使わないスクリプト（`start:dev`・`test:watch` など）や見本は入れない。
  `nest-cli.json` は `deleteOutDir` のために残す（無いと `dist/` を消したあとビルドし直せない）
- **最小限の構成**: Podman・compose・Next.js・Amplify・OpenAPI は使わない。**AWS（Cognito）が無くても全部進められる**
- 題材は B（`nestjs-cognito-auth-handson`）の最後の節（`05-refactor/01-auth-middleware`）と同じ形: `POST /notes`（トークン要る）・`GET /notes`（誰でも）・`DELETE /notes/:id`（作った人だけ。ほかの人は 403、無ければ 404）。
  ノートは `{ id, text, ownerId }` をメモリ上の配列に持つ。認証は `AuthMiddleware`（`forRoutes()` で POST と DELETE にだけ掛ける）。
  B と違い、トークンの検証は DI で差し替えられる `TokenVerifier` クラスに切り出し、Floci・Podman は使わない
- 言語は **TypeScript**（ESM で、import の末尾は `.js`）。はじめのプロジェクトにテストの道具は入れず、Vitest は 03-01、coverage-v8 は 03-02、`@nestjs/testing`・supertest は 04、Playwright は 05 で入れる
- パッケージマネージャはレクチャー側が **npm**（`api/package-lock.json`）、サイトが pnpm
- ポートは 3000（E2E テストは、ふだんの起動とぶつからないように 3100）
- `.env`・`.env.example` は置かない（`.env` の読み込みもしない）。本物の `TokenVerifier` は Cognito の ID が無ければ WARN を出してどのトークンも 401 にする
- **秘匿情報（ユーザープール ID・クライアント ID・AWS アカウント ID・キー）の実値は絶対にコミットしない**

## 本文の分量

- 重要な要素だけを理解させる。「あったら良い」説明は書かない
- 手順は 1 通りに絞る。選択肢や別解（バージョン管理ツール・winget などの別の入れ方）を並べない。「〜でもかまいません」も書かない
- 任意の道具の紹介・豆知識・歴史や背景の長い説明・同じことの言い直し・比較表（Jest との対応など）は書かない
- `::diff` の下の箇条書きは、そのコードを読むのに欠かせない点だけにする
- `:::faq` は、手順どおりに進めても本当につまずく問題だけにする。無ければ `:::faq` ごと書かない
- 残すもの: その節の重要な要素、テストでの認証の注意、`USE_FAKE_AUTH` の警告、打つコマンドと期待する出力

## 本文の書き方（センチネル）

- コードの変更は `::diff{file="api/src/main.ts"}` で示す。前の節の同じファイルとの差分を実ファイルから生成する
  （`site/scripts/libs/project-diff.mjs`）。新規ファイルは全行 `+`。本文にコードを手で二重に書かない
  - `::diff[どこを書き換えるか]{file="..."}` で説明を付けられる
  - `::diff` は先頭に「`api/src/main.ts` を変更する」の見出しを自動で付ける（前の節に無ければ「作成する」、
    この節で消したなら「削除する」。漢字で書く）。見出しの深さは直前の見出しより 1 つ深い。
    本文に「`...` を作ります」のような、見出しと重なる文は書かない
  - 比べる相手を変えるときは `from="<sec>/<lec>"`、前の節でのファイル名が違うときは `fromFile="..."`
  - 本文のコマンド（`npm install` など）が作った・書き換えたファイルに手で書き足すときは、コマンドの直後のファイルを
    節の `generated/<file>` に置き、`base="generated"` で比べる（`generated/` は ZIP・`::tree` に入らない）
  - コマンドが作った・書き換えた結果を見せるだけの差分には `by="command"` を付ける。見出しが「`...` が作られる／が変わる／が消える」になり、
    手で書く手順（「作成する／変更する／削除する」）と見分けられる
- ページの最後は「参考にした公式ドキュメント」→「この節を終えたときのディレクトリ」見出し → `::tree` → `:::download` ＋ `[...](./project.zip)` → `:::faq`
  - `::tree` は、その節のプロジェクト全体をエディタ（左にツリー、右にコード）で見せる。前の節から追加・変更したファイルに「作成」「変更」の印、変更したファイルの足した行に色を付ける。`package-lock.json` と画像は中身を省く
- コマンドの実行例は普通のコードブロックで書く
- 「参考にした公式ドキュメント」は `- [名前](URL) … 何を参考にしたか` の形で並べる。リンクは開けることと、書いた中身が本当にそのページにあることを確かめてから載せる
- よくある質問は `:::faq`、注意は `:::warning` / `:::danger` / `:::notice`
- 手順が OS で分かれるところは `:::::platform` で囲み、中を `::::macos` / `::::windows` / `::::linux`（`::::macos-linux` のように `-` でつなぐと両方に出す）に分ける
  - Windows は PowerShell 7 の手順を書く（WSL は使わない）。bash のコマンドで PowerShell では動かないもの（`\` の改行・`/dev/null`・`export`・`rm -rf`・`VAR=値 コマンド` など）は、`::::macos-linux` と `::::windows` に分ける
  - 選んだ OS は localStorage（キー `handson-os`）に残り、ナビゲーションバーの選択欄と `::platform-choice`（01-01 に置いている）で変える
  - パネルの中に見出し（`##`・`###`）は書かない（目次に残って、隠れた所を指してしまう）
- 「次へ」の見出しやリンクは書かない（Starlight の前へ／次へと重複するため）

## テストでの認証

- テストでの認証は **トークンの直書き**（`alice-token`・`bob-token` を通す `FakeTokenVerifier`）
- 結合テストは `overrideProvider(TokenVerifier).useClass(FakeTokenVerifier)`、E2E テストは API の `USE_FAKE_AUTH=true`（`AppModule` が偽物を使う）と、
  Playwright の `request` に `Authorization: Bearer alice-token` を付けて作成・削除し、一覧の画面（`/notes.html`）に反映されるかを見る
- 本来の方法（テスト用ユーザーでのサインイン、setup project と storageState など）には触れない、と本文に書く

## サイト（site/）の開発

パッケージマネージャは **pnpm**（`site/package.json` の `packageManager` で固定）。

```sh
cd site
pnpm install
pnpm run dev      # http://localhost:4321（predev で previews / sync / downloads が走る）
pnpm run build    # 本番ビルド
```

- ZIP・`::tree`・`::diff` は `git ls-files --cached --others --exclude-standard` の結果を使う。
  `.gitignore` 済みのもの（`node_modules/`・`dist/`・`coverage/`）は入らない
- 依存を上げ直すときに踏みやすい点（esbuild の allowBuilds、archiver 8 の `ZipArchive`、Astro 7 の
  `@astrojs/markdown-remark`）は `.claude/handson-builder-conventions.md` を参照

## サイトへの公開ルール

- frontmatter に `docs: true` を持つマークダウンだけが `site/scripts/sync-lectures.mjs` に拾われる
- 文章は必ず `sections/` 側に書く。`site/src/content/docs/` は自動生成なので直接編集しない
- 相対リンクは sync スクリプトが自動変換する（他の節 → サイト内 URL、ソースコード → GitHub blob、
  画像 → GitHub raw、`./project.zip` → その節の ZIP、`./start.zip` → 前の節の ZIP）

## 進め方（このリポジトリ）

- 章ごとにブランチを切って PR を作る。ビルドとテストが通ることを確かめてからマージしてよい
- 方針が変わったらイシュー #1 の本文を更新する
