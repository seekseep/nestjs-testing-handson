#!/usr/bin/env node
/**
 * 各節の先頭サムネイル（images/00-thumbnail.svg）を、同じ見た目で生成する。
 *
 *   node tools/thumbnail.mjs            … 下の THUMBNAILS をすべて書き出す
 *
 * 節を足したら THUMBNAILS に 1 行足して実行する。チップは「その節で触る道具」。
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// 道具ごとの色。チップの左の丸に使う。
const TOOL_COLORS = {
  'Node.js': '#5FA04E',
  npm: '#CB3837',
  NestJS: '#E0234E',
  'VS Code': '#007ACC',
  TypeScript: '#3178C6',
  Middleware: '#475569',
  Vitest: '#729B1B',
  Coverage: '#475569',
  supertest: '#475569',
  Playwright: '#2EAD33',
  HTML: '#E34F26',
  Podman: '#892CA0',
  SQLite: '#003B57',
};

const THUMBNAILS = [
  ['01-setup/01-environment', '01', '準備', ['Node.js', 'VS Code', 'Podman']],
  ['02-project/01-start', '02', '起動する', ['Podman', 'NestJS', 'HTML']],
  ['02-project/02-request-flow', '02', 'リクエストの流れ', ['NestJS', 'SQLite']],
  ['03-test-types/01-test-types', '03', 'テストの種類', ['Vitest', 'supertest', 'Playwright']],
  ['04-unit-test/01-design', '04', '単体テストの設計', ['Vitest']],
  ['04-unit-test/02-first-test', '04', '単体テストを書く', ['Vitest']],
  ['04-unit-test/03-more-cases', '04', '単体テストを足す', ['Vitest']],
  ['05-integration-test/01-design', '05', '結合テストの設計', ['Vitest', 'supertest', 'SQLite']],
  ['05-integration-test/02-first-test', '05', '結合テストを書く', ['Vitest', 'supertest', 'SQLite']],
  ['05-integration-test/03-more-cases', '05', '結合テストを足す', ['Vitest', 'supertest', 'SQLite']],
  ['06-e2e-test/01-design', '06', 'E2E テストの設計', ['Playwright', 'Podman']],
  ['06-e2e-test/02-first-test', '06', 'E2E テストを書く', ['Playwright', 'Podman']],
  ['06-e2e-test/03-more-cases', '06', 'E2E テストを仕上げる', ['Playwright', 'Podman']],
  ['07-di-container/01-database-provider', '07', 'DB をプロバイダーにする', ['NestJS', 'SQLite']],
  ['07-di-container/02-repository', '07', 'リポジトリを注入する', ['NestJS', 'SQLite']],
  ['07-di-container/03-service', '07', 'サービスを注入する', ['NestJS']],
  ['07-di-container/04-service-test', '07', '偽物に差し替えてテストする', ['Vitest', 'NestJS']],
  ['08-column/00-index', '08', 'コラム', ['Vitest', 'NestJS', 'Playwright']],
];

function escapeXml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
}

// 全角は 1、半角は 0.55 として、だいたいの文字幅を見積もる（チップの幅を決めるため）。
function textWidth(s, size) {
  let w = 0;
  for (const ch of s) w += /[\u0000-ÿ]/.test(ch) ? 0.62 : 1;
  return w * size;
}

function render(chapter, title, tools) {
  const W = 960;
  const H = 400;
  const font = `'Hiragino Sans','Noto Sans JP','Yu Gothic UI',system-ui,sans-serif`;
  const titleSize = textWidth(title, 46) > W - 120 ? 38 : 46;
  let x = 64;
  const chips = tools
    .map((tool) => {
      const label = escapeXml(tool);
      const w = textWidth(tool, 22) + 76;
      const color = TOOL_COLORS[tool] ?? '#475569';
      const g = `<g transform="translate(${x} 270)"><rect width="${w}" height="52" rx="26" fill="#ffffff" stroke="#d6dde8" stroke-width="2"/><circle cx="28" cy="26" r="9" fill="${color}"/><text x="46" y="34" font-size="22" font-weight="600" fill="#1e293b" font-family="${font}">${label}</text></g>`;
      x += w + 16;
      return g;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escapeXml(`${chapter} 章: ${title}`)}">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef4ff"/><stop offset="1" stop-color="#fdf2f8"/></linearGradient></defs>
<rect width="${W}" height="${H}" rx="24" fill="url(#bg)"/>
<circle cx="860" cy="70" r="120" fill="#e0234e" opacity="0.07"/>
<circle cx="900" cy="330" r="90" fill="#111111" opacity="0.05"/>
<text x="64" y="104" font-size="24" font-weight="700" fill="#e0234e" font-family="${font}" letter-spacing="2">CHAPTER ${escapeXml(chapter)}</text>
<text x="64" y="186" font-size="${titleSize}" font-weight="800" fill="#0f172a" font-family="${font}">${escapeXml(title)}</text>
<rect x="64" y="216" width="96" height="6" rx="3" fill="#0f172a"/>
${chips}
</svg>
`;
}

let count = 0;
for (const [rel, chapter, title, tools] of THUMBNAILS) {
  // まだ作っていない節は飛ばす（節のディレクトリを先回りして作らない）。
  const lectureDir = path.join(ROOT, 'sections', ...rel.split('/'));
  if (!existsSync(lectureDir)) continue;
  const dir = path.join(lectureDir, 'images');
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, '00-thumbnail.svg'), render(chapter, title, tools));
  count += 1;
}
console.log(`[thumbnail] wrote ${count} thumbnails`);
