/**
 * 「前の節と比べて何が変わったか」を本文に出すセンチネル。sentinels.mjs から呼ばれる。
 *
 *   ::diff{file="api/src/main.ts"}
 *     … 先頭に「`api/src/main.ts` を変更する」の見出し（前の節に無ければ「作成する」、
 *       この節で消していれば「削除する」）を付け、直前の見出しより 1 つ深くする。
 *       続けて、前の節（libs/lectures.mjs の previousProjectLecture）の同じファイルと比べた差分を、
 *       `:::code{filepath=... offset=... newOffset=...}` ＋ 差分のコードブロックに展開する。
 *       前の節に無いファイルは全行が `+`、この節で消したファイルは全行が `-` になる。
 *       変更箇所が離れていれば、塊（hunk）ごとにブロックを分ける。
 *   ::diff[説明]{file="..."}            … 最初のブロックの上に「どこに書くか」の説明を出す。
 *   ::diff{file="..." from="<sec>/<lec>"}  … 比べる相手の節を指定する（既定は直前の節）。
 *   ::diff{file="..." fromFile="..."}   … 前の節でのファイル名が違うとき（移動・改名）。
 *   ::diff{file="..." context="5"}      … 変更の前後に何行出すか（既定 3）。
 *
 *   ::tree
 *     … この節を終えたときのプロジェクトのディレクトリツリー。前の節と比べて
 *       追加したファイルを緑（ins）、変更したファイルを強調（mark）で示し、行末に印を付ける。
 *       消したファイルは末尾にまとめて出す。
 *   ::tree{from="<sec>/<lec>"}          … 比べる相手の節を指定する。
 *
 * 本文にコードを二重に書かないための仕掛け。サンプルを直せば本文の差分も自動で追従する。
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { structuredPatch } from 'diff';

import { lsProjectFiles } from './git.mjs';
import { previousProjectLecture } from './lectures.mjs';
import { isTreeHidden, zipRootFor } from './naming.mjs';
import { ROOT } from './paths.mjs';

const LANG_BY_EXT = new Map([
  ['.ts', 'ts'],
  ['.tsx', 'tsx'],
  ['.js', 'js'],
  ['.mjs', 'js'],
  ['.cjs', 'js'],
  ['.json', 'json'],
  ['.yaml', 'yaml'],
  ['.yml', 'yaml'],
  ['.md', 'md'],
  ['.css', 'css'],
  ['.html', 'html'],
  ['.sh', 'sh'],
]);

const LANG_BY_NAME = new Map([
  ['Containerfile', 'dockerfile'],
  ['Dockerfile', 'dockerfile'],
  ['.containerignore', 'text'],
  ['.dockerignore', 'text'],
  ['.gitignore', 'text'],
]);

function langOf(file) {
  const base = path.posix.basename(file);
  if (LANG_BY_NAME.has(base)) return LANG_BY_NAME.get(base);
  if (base.startsWith('.env')) return 'ini';
  return LANG_BY_EXT.get(path.posix.extname(base).toLowerCase()) ?? 'text';
}

async function readOrNull(abs) {
  try {
    return await readFile(abs, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
}

/** 中身に ``` を含むときは、それより長いフェンスで囲む。 */
function fenceFor(lines) {
  let longest = 2;
  for (const line of lines) {
    const m = line.match(/`{3,}/g);
    if (m) for (const run of m) longest = Math.max(longest, run.length);
  }
  return '`'.repeat(longest + 1);
}

/** `<sec>/<lec>` か `sections/<sec>/<lec>` を `sections/<sec>/<lec>` にそろえる。 */
function normalizeLectureRef(ref) {
  const s = String(ref).trim().replace(/^\/+|\/+$/g, '');
  return s.startsWith('sections/') ? s : `sections/${s}`;
}

function baseLectureOf(lectureRel, from) {
  return from ? normalizeLectureRef(from) : previousProjectLecture(lectureRel);
}

/** ::diff を展開した Markdown を返す。展開できなければ null（呼び出し側が警告する）。 */
export async function buildDiffBlock({ lectureRel, attrs, label, where, headingLevel = 3 }) {
  const file = String(attrs.file ?? '').trim();
  if (!file || file.split('/').some((seg) => seg === '..')) {
    console.warn(`[sentinels] ::diff needs file="<path>" in ${where} (skipped)`);
    return null;
  }
  const baseRel = baseLectureOf(lectureRel, attrs.from);
  const current = await readOrNull(path.join(ROOT, ...lectureRel.split('/'), ...file.split('/')));
  const previous = baseRel
    ? await readOrNull(path.join(ROOT, ...baseRel.split('/'), ...String(attrs.fromFile ?? file).split('/')))
    : null;
  if (current === null && previous === null) {
    console.warn(`[sentinels] ::diff file not found: ${file} in ${where} (skipped)`);
    return null;
  }
  if (current === previous) {
    console.warn(`[sentinels] ::diff no changes in ${file} (${where}, skipped)`);
    return null;
  }

  const context = /^\d+$/.test(String(attrs.context ?? '')) ? Number(attrs.context) : 3;
  const patch = structuredPatch(file, file, previous ?? '', current ?? '', '', '', { context });
  const lang = langOf(file);
  const blocks = [];
  patch.hunks.forEach((hunk, i) => {
    const lines = hunk.lines.filter((l) => !l.startsWith('\\'));
    const fence = fenceFor(lines);
    const note = i === 0 && label ? `[${label}]` : '';
    // 追加だけの塊は oldStart が 0 になる。行番号は 1 から数えるのでそろえる。
    const offset = Math.max(1, hunk.oldStart);
    const newOffset = Math.max(1, hunk.newStart);
    blocks.push(
      [
        `:::code${note}{filepath="${file}" offset=${offset} newOffset=${newOffset}}`,
        fence + lang,
        ...lines,
        fence,
        ':::',
      ].join('\n'),
    );
  });
  const action = previous === null ? '作成' : current === null ? '削除' : '変更';
  const heading = `${'#'.repeat(headingLevel)} \`${file}\` を${action}する`;
  return [heading, ...blocks].join('\n\n');
}

/** レクチャー相対のプロジェクトファイル一覧（ツリーに出すものだけ）。 */
async function projectFiles(lectureRel) {
  const files = await lsProjectFiles(ROOT, lectureRel);
  return files.map((f) => path.posix.relative(lectureRel, f)).filter((rel) => !isTreeHidden(rel));
}

/** パスの一覧から木構造を作る。 */
function toTree(files) {
  const root = new Map();
  for (const rel of files) {
    let node = root;
    for (const seg of rel.split('/')) {
      if (!node.has(seg)) node.set(seg, new Map());
      node = node.get(seg);
    }
  }
  return root;
}

/** ディレクトリを先に、それぞれ名前順で並べる（エディタのエクスプローラーと同じ）。 */
function sortedEntries(node) {
  return [...node.entries()].sort(([a, an], [b, bn]) => {
    const ad = an.size > 0;
    const bd = bn.size > 0;
    if (ad !== bd) return ad ? -1 : 1;
    return a.localeCompare(b);
  });
}

/** 連続する行番号を `{1-3,7}` の形にまとめる（Expressive Code の ins 用）。 */
function ranges(lines) {
  const parts = [];
  for (let i = 0; i < lines.length; i++) {
    let j = i;
    while (j + 1 < lines.length && lines[j + 1] === lines[j] + 1) j++;
    parts.push(i === j ? `${lines[i]}` : `${lines[i]}-${lines[j]}`);
    i = j;
  }
  return `{${parts.join(',')}}`;
}

/** 前の内容から、今の内容で足した行（1 始まり）を返す。 */
function addedLines(before, after) {
  const patch = structuredPatch('a', 'b', before, after, '', '', { context: 0 });
  const out = [];
  for (const hunk of patch.hunks) {
    let line = hunk.newStart;
    for (const l of hunk.lines) {
      if (l.startsWith('+')) out.push(line++);
      else if (!l.startsWith('-')) line++;
    }
  }
  return out;
}

// コードの中に ``` があってもフェンスが閉じないよう、中身より長いフェンスを使う
function fenceForText(text) {
  const longest = Math.max(2, ...[...text.matchAll(/`+/g)].map((m) => m[0].length));
  return '`'.repeat(longest + 1);
}

// 中身をエディタに出さないファイル（長すぎる・文字ではない）
const PLACEHOLDER_NAMES = new Set(['package-lock.json', 'pnpm-lock.yaml']);
const BINARY_EXT = new Set(['.ico', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.zip', '.woff', '.woff2']);

function displayText(rel, buf) {
  const base = path.posix.basename(rel);
  if (PLACEHOLDER_NAMES.has(base)) return { text: '（npm install が書き出すファイルです。長いので、ここでは中身を省いています。ZIP には入っています）', lang: 'text' };
  if (BINARY_EXT.has(path.posix.extname(rel).toLowerCase()) || buf.includes(0)) {
    return { text: '（画像などの、文字ではないファイルです。ZIP には入っています）', lang: 'text' };
  }
  return { text: buf.toString('utf8').replace(/\n+$/, ''), lang: langOf(rel) };
}

/**
 * ::tree を展開した Markdown を返す。
 * この節を終えたときのプロジェクトを、エディタ（`::::editor{tree="true"}`、remark-editor.mjs）で見せる。
 * 左のツリーでファイルを選ぶと、右に中身が出る。前の節と比べて足したファイルには「作成」、
 * 変えたファイルには「変更」の印が付き、変えたファイルでは足した行に色が付く。
 */
export async function buildTreeBlock({ lectureRel, sec, lec, attrs }) {
  const files = await projectFiles(lectureRel);
  if (files.length === 0) return null;
  const baseRel = baseLectureOf(lectureRel, attrs.from);
  const baseFiles = baseRel ? new Set(await projectFiles(baseRel)) : new Set();
  const read = (lecRel, rel) => readFile(path.join(ROOT, ...lecRel.split('/'), ...rel.split('/')));

  // エディタのファイル一覧と同じ並び（フォルダが先、同じフォルダの中は名前順）
  const sortKey = (rel) => rel.split('/').map((seg, i, all) => (i < all.length - 1 ? `0${seg}` : `1${seg}`)).join('/');
  const rels = files.slice().sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

  const blocks = [];
  const status = new Map();
  for (const rel of rels) {
    const cur = await read(lectureRel, rel);
    const { text, lang } = displayText(rel, cur);
    const meta = [`data-file="${rel}"`];
    if (!baseFiles.has(rel)) {
      status.set(rel, 'added');
      if (baseRel) meta.push('data-status="added"');
    } else {
      const prev = await read(baseRel, rel);
      if (!cur.equals(prev)) {
        status.set(rel, 'changed');
        meta.push('data-status="changed"');
        // 中身を省いたファイル（ロックファイル・画像）には行の印を付けない
        const omitted = PLACEHOLDER_NAMES.has(path.posix.basename(rel)) || BINARY_EXT.has(path.posix.extname(rel).toLowerCase());
        if (!omitted) {
          const marks = addedLines(prev.toString('utf8'), cur.toString('utf8'));
          // 全部の行が新しいときは印を付けない（全体が緑になって読みにくい）
          if (marks.length && marks.length < text.split('\n').length) meta.push(`ins=${ranges(marks)}`);
        }
      }
    }
    const fence = fenceForText(text);
    blocks.push(`${fence}${lang} ${meta.join(' ')}`, text, fence);
  }

  // 最初に開くのは、この節で足した（なければ変えた）ファイル。設定ファイル（. で始まる）とロックファイルは後回し
  const order = (rel) => (status.get(rel) === 'added' ? 0 : status.get(rel) === 'changed' ? 1 : 2);
  const minor = (rel) => {
    const base = path.posix.basename(rel);
    return base.startsWith('.') || PLACEHOLDER_NAMES.has(base) || rel.endsWith('.d.ts') ? 1 : 0;
  };
  const open = baseRel ? rels.filter((rel) => order(rel) < 2).sort((a, b) => minor(a) - minor(b) || order(a) - order(b))[0] : undefined;

  const title = zipRootFor(sec, lec);
  const out = [`::::editor{title="${title}" tree="true"${open ? ` open="${open}"` : ''}}`, ...blocks, '::::'];

  const currentSet = new Set(files);
  const removed = [...baseFiles].filter((rel) => !currentSet.has(rel)).sort();
  if (removed.length > 0) {
    out.push('', 'この節で削除したファイル: ' + removed.map((rel) => `\`${rel}\``).join('、'));
  }
  return out.join('\n');
}
