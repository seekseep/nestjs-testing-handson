# AGENTS.md - プロジェクト方針

## プロジェクト概要

割り勘のアプリ（NestJS の API と SQLite、画面は HTML 1 枚。認証なし）に、単体テスト（Vitest）・結合テスト（Vitest と supertest）・E2E テスト（Playwright）を書き、06 章で DI を使う形に書き換えて単体テストを広げるハンズオン教材。
3 本に分けたハンズオンの C（A: 基本的な REST API `nestjs-rest-api-handson`、B: Cognito で認証と認可 `nestjs-cognito-auth-handson`）。
A も B も終えていなくても始められるように、02 章で割り勘のアプリを ZIP で配る。
handson-builder スキルの骨格（`sections/` ＋ Starlight の `site/` ＋ GitHub Pages）を使っている。
全体の計画と方針の正本は GitHub のイシュー #1。

## 用語：章（セクション）と節（レクチャー）

| 用語 | 指すもの | 例 |
|---|---|---|
| **章** | `sections/<NN-section>/`。章立ては固定（イシュー #1） | `03-unit-test/` |
| **節** | `sections/<NN-section>/<NN-lecture>/`。増減してよい | `03-unit-test/01-settle/` |

- 節のディレクトリは **その節を終えた時点のプロジェクト** を丸ごと持つ（`api/`）
- 次の節は、前の節のディレクトリをコピーして差分を足して作る（`tools/copy-lecture.sh <前の節> <次の節>`）
- 本文は `LECTURE.md`（`docs: true`）。節の直下に `README.md` は置かない（起動方法は本文に書く）
- 説明図は `images/` に SVG で置く（`00-thumbnail.svg` を先頭サムネに。`tools/thumbnail.mjs` の THUMBNAILS に足して `node tools/thumbnail.mjs`）
- 章の直下には README を置かない
- 準備（`01-setup/01-environment`）とリクエストの流れ（`02-project/02-request-flow`）はプロジェクトを持たない（本文だけ）。配るアプリは `02-project/01-start`

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
    ├── test/         結合テスト（04 章から）
    └── e2e/          E2E テスト（05 章から。playwright.config.ts も api/ に置く）
```

- **プロジェクトのファイルは最小限**: ビルド・起動・教材のテストに要るものだけを置く。lint・format・`.gitattributes`・README・AGENTS.md は入れない
- 題材は割り勘: `POST/GET /members`・`POST/GET /payments`・`GET /settlement`。DB は SQLite（`node:sqlite` の `DatabaseSync`）で、表は `members`・`payments`・`payment_participants`（列は camelCase）。
  計算は `src/settlement/settle.ts` の `split`・`balances`・`settle`（DB も HTTP も使わない関数）
- 02〜05 章は **コントローラーに直書き**（`openDatabase()`・SQL・結果の組み立て）。06 章で DB のプロバイダー → リポジトリ → `SettlementService` → サービスの単体テスト、と段階的に書き換える（02-02 で「素直に実装した形」と書く）
- 画面は `web`（`127.0.0.1:3000`）、API は `api`（`127.0.0.1:3001`）。画面から API を呼ぶために `main.ts` で `enableCors()` する
- DB のファイルは環境変数 `DB_PATH`（既定は `warikan.db`）。コンテナでは `/data/warikan.db`（ボリューム）。結合テストはテストごとに一時ファイルを `DB_PATH` にする
- テストは、単体・結合は手元の Node.js、E2E は Podman で動かした画面と API に対して流す（E2E の前に `podman compose down --volumes` でデータを消す）
- 言語は **TypeScript**（ESM で、import の末尾は `.js`）。配るアプリにテストの道具は入れず、Vitest は 03、`@nestjs/testing`・supertest は 04、Playwright は 05 で入れる
- パッケージマネージャはレクチャー側が **npm**（`api/package-lock.json`）、サイトが pnpm。Node 26・`@types/node@26`・Podman の手順と Dockerfile は B とそろえる
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
