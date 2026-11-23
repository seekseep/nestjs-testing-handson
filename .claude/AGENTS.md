# AGENTS.md - プロジェクト方針

## プロジェクト概要

割り勘のアプリ（NestJS の API と SQLite、画面は HTML 1 枚。認証なし）に、単体テスト（Vitest）・結合テスト（Vitest と supertest）・E2E テスト（Playwright）を書き、07 章「DI コンテナ」で DB・リポジトリ・サービスを切り出し、結合テストでしか確かめられなかったことをアプリも DB も起動せずに確かめられるようにするハンズオン教材。
3 本に分けたハンズオンの C（A: 基本的な REST API `nestjs-rest-api-handson`、B: Cognito で認証と認可 `nestjs-cognito-auth-handson`）。
A も B も終えていなくても始められるように、02 章で割り勘のアプリを ZIP で配る。
handson-builder スキルの骨格（`sections/` ＋ Starlight の `site/` ＋ GitHub Pages）を使っている。
全体の計画と方針の正本は GitHub のイシュー #1。

## 用語：章（セクション）と節（レクチャー）

| 用語 | 指すもの | 例 |
|---|---|---|
| **章** | `sections/<NN-section>/`。章立ては固定（イシュー #1） | `04-unit-test/` |
| **節** | `sections/<NN-section>/<NN-lecture>/`。増減してよい | `04-unit-test/02-first-test/` |

- 節のディレクトリは **その節を終えた時点のプロジェクト** を丸ごと持つ（`api/`）
- 次の節は、前の節のディレクトリをコピーして差分を足して作る（`tools/copy-lecture.sh <前の節> <次の節>`）
- 本文は `LECTURE.md`（`docs: true`）。節の直下に `README.md` は置かない（起動方法は本文に書く）
- 説明図は `images/` に SVG で置く（`00-thumbnail.svg` を先頭サムネに。`tools/thumbnail.mjs` の THUMBNAILS に足して `node tools/thumbnail.mjs`）
- ほかの図は genfig で、`images/NN-xxx.py` から同じ名前の `.svg` を作る。genfig は `.claude/skills/genfig` にサブモジュール（`seekseep/genfig-skill`）として入れてあり、`.py` はファイルの場所から上へたどってそこを読む。clone するときは `git clone --recurse-submodules`（clone 済みなら `git submodule update --init`）。`text` のコードブロックにアスキーアートの図を描かない。alt に中身が分かる説明を書き、SVG は `xmllint --noout` を通す
  - 節ごとに変わる図（02-02 のリクエストの流れ、07 章の構成図、05-01・06-01 の範囲）は、同じ構図のスクリプトを `STAGE` だけ変えて作る。その節で扱うものに色を付け、ほかは灰色にする
- 章の直下には README を置かない
- 準備（`01-setup/01-environment`）・リクエストの流れ（`02-project/02-request-flow`）・テストの種類（`03-test-types/01-test-types`）・04〜06 章の設計の節（`01-design`）はプロジェクトを持たない（本文だけ）。配るアプリは `02-project/01-start`
- 04〜06 章は、どれも「設計（`01-design`。コードは書かず、範囲の図とテストケースの表）→ 書く（`02-first-test`。1〜2 ケース）→ 足す（`03-more-cases`。表の残り）」の 3 節。テストのコードには表の番号（S1・B1・T1、I1〜I3、E1〜E4）をコメントで付ける

## プロジェクトの形

```text
sections/<sec>/<lec>/
├── LECTURE.md        教材本文（ZIP に入らない）
├── images/           説明図（ZIP に入らない）
├── generated/        ::diff{base="generated"} の比べる相手（ZIP に入らない）
└── api/              NestJS（1 つだけ）
    ├── compose.yaml        api（NestJS と SQLite。ファイルはボリューム db）と web（nginx で public/ を配る）
    ├── Dockerfile          B と同じ
    ├── public/index.html   画面（素の HTML と fetch）
    ├── src/
    ├── test/         結合テスト（05 章から。*.e2e-spec.ts）
    └── e2e/          E2E テスト（06 章から。*.test.ts。playwright.config.ts も api/ に置く）
```

- **`api/` は `nest new` が作ったものを消さずに使う**: `npx @nestjs/cli@12 new api --package-manager npm --skip-tests --type esm --no-observe --skip-skills` の出力（`AGENTS.md`・`README.md`・oxlint・Prettier・Vitest の設定とパッケージ・`scripts`、`AppController`・`AppService` も）に、割り勘のコード・`compose.yaml`・`Dockerfile`・`.dockerignore`・`public/` を足した形。A（REST API）の #50 と同じ方針
- 題材は割り勘: `POST/GET /members`・`POST/GET /payments`・`GET /settlement`。DB は SQLite（`node:sqlite` の `DatabaseSync`）で、表は `members`・`payments`・`payment_participants`（列は camelCase）。
  計算は `src/settlement/settle.ts` の `split`・`balances`・`settle`（DB も HTTP も使わない関数）
- 02〜06 章は **コントローラーに直書き**（`openDatabase()`・SQL・結果の組み立て）。07 章で DB の `DatabaseModule`（`nest g module database`）→ リポジトリ → `SettlementService`（`nest g service settlement --no-spec`）→ サービスの単体テスト、と段階的に書き換える（02-02 で「素直に実装した形」と書く）
- 画面は `web`（`127.0.0.1:3000`）、API は `api`（`127.0.0.1:3001`）。画面から API を呼ぶために `main.ts` で `enableCors()` する
- DB のファイルは環境変数 `DB_PATH`（既定は `warikan.db`）。コンテナでは `/data/warikan.db`（ボリューム）。結合テストはテストごとに一時ファイルを `DB_PATH` にする
- テストは、単体・結合は手元の Node.js、E2E は Podman で動かした画面と API に対して流す（E2E の前に `podman compose down --volumes` でデータを消す）
- 言語は **TypeScript**（ESM で、import の末尾は `.js`）。Vitest（4 系）・`@nestjs/testing`・supertest は `nest new` が入れたものをそのまま使う（版を上げない）。Playwright だけ 06-02 で入れる
- テストのファイルとコマンドは `nest new` の設定に合わせる: 単体テストは `src/` の `*.spec.ts` を `npm test`（`vitest.config.ts`）、結合テストは `test/` の `*.e2e-spec.ts` を `npm run test:e2e`（`vitest.config.e2e.ts`。NestJS は e2e と呼ぶが、教材では結合テストと呼ぶ）、E2E テストは `e2e/` の `*.test.ts` を `npx playwright test`（`*.spec.ts` にすると Vitest が拾う）
- E2E テストは、最初に API（`request`）でデータが空であることを確かめてから画面を操作する（古いデータで通ってしまうのを防ぐ）
- パッケージマネージャはレクチャー側が **npm**（`api/package-lock.json`）、サイトが pnpm。Node 26・Podman の手順と Dockerfile は B とそろえる。`@types/node` は `nest new` が入れたもの（24 系）のまま
- **秘匿情報の実値は絶対にコミットしない**

## 本文の分量

- 重要な要素だけを理解させる。「あったら良い」説明は書かない
- 手順は 1 通りに絞る。選択肢や別解（バージョン管理ツール・winget などの別の入れ方）を並べない。「〜でもかまいません」も書かない
- 任意の道具の紹介・豆知識・歴史や背景の長い説明・同じことの言い直し・比較表（Jest との対応など）は書かない
- `::diff` の下の箇条書きは、そのコードを読むのに欠かせない点だけにする
- `:::faq` は、手順どおりに進めても本当につまずく問題だけにする。無ければ `:::faq` ごと書かない
- 残すもの: その節の重要な要素、打つコマンドと期待する出力

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
- 動作の確認は「## 動作確認する」の見出しにし、「〜になれば大丈夫です」で結ぶ。テストを流すところは「## 動かす」

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
