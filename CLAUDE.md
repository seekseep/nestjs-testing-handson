# CLAUDE.md

このリポジトリ（NestJS のテストのハンズオン教材。Vitest・supertest・Playwright）で作業するときの決まり。

## 必ず守ること

- 返答は日本語で書く（コード・コマンド・識別子は英語のままでよい）
- commit・PR に `Co-Authored-By` や「Generated with Claude Code」を付けない
- 秘密情報（ユーザープール ID・クライアント ID・AWS アカウント ID・アクセスキー・`.env` の実値）はコミットしない。
  `git add -A` / `git add .` は使わず、何を add するか確かめる
- このリポジトリでは、章ごとのブランチ・PR の作成と、確認が通った PR の自分でのマージをしてよい

## 読むもの

- `.claude/AGENTS.md` … プロジェクト方針（節のディレクトリの形、センチネル `::diff` / `::tree`、サイトの開発）
- `.claude/HANDOFF.md` … 状況と、決まっている設計
- `.claude/handson-builder-conventions.md` … 元にした handson-builder スキルの規約（Office マクロ系など、このリポジトリで使わない部分も含む）
- GitHub のイシュー #1 … 全体計画の正本。方針が変わったら本文を更新する

## 新しいライブラリを使う前に

記憶で書かず、同梱・公式のドキュメントを読む。

- NestJS: `https://docs.nestjs.com/<章>.md`（索引は `https://docs.nestjs.com/llms.txt`）
- Vitest: `https://vitest.dev/guide/`
- Playwright: `https://playwright.dev/docs/intro`
