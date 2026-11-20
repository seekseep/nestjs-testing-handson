/**
 * `::::editor{title="..." zip="URL" open="main.js"}` コンテナディレクティブを、簡易エディタ UI
 * `<section class="editor">`（左=ファイル一覧・右=コード）に変換する remark プラグイン。
 *
 * 属性:
 *   title … ヘッダの文言（省略時は「このステップの完成例」）
 *   zip   … ZIP ダウンロードボタンのリンク先。省略するとボタンを出さない（デモなど配布物が無い場合）
 *   open  … 最初に開くファイル名（省略時は先頭）
 *
 * コンテナの中身は sync-lectures.mjs（libs/sentinels.mjs）が実ファイルから生成した
 * コードフェンス（各 fence の meta に `data-file="<相対パス>"`）。このプラグインは:
 *   - 各コードフェンスからファイル名を読み取り（meta は消して Expressive Code の枠を出さない）
 *   - 左のファイル切り替えボタン、右のコードペインを組み立てる
 *   - ヘッダに ZIP ダウンロードボタンを付ける
 * tree="true" のときは、フォルダとファイルにアイコンを付けてツリーのように並べる。
 * ヘッダには「全画面」ボタンを付ける（押したときの挙動は editor-client.js）。
 * タブ切り替えの挙動は site/src/scripts/editor-client.js（全ページに inline 注入）。
 * 装飾は site/src/styles/editor.css。
 *
 * NOTE: 中で ZIP ボタンを自前生成するため remark-download には依存しない。
 * コンテナは 4 コロン（::::）で開く（中にコードフェンスを含むため 3 コロンでもよいが統一）。
 */

import { platformZips } from './lib/platform-zip.mjs';

const NAME = 'editor';
const FILE_META_RE = /data-file="([^"]*)"/;
// 積み上げ方式で、このレクチャーで足した（added）・変えた（changed）ファイルに付く印
const STATUS_META_RE = /data-status="(added|changed)"/;
const STATUS_LABEL = { added: '作成', changed: '変更' };
const DEFAULT_TITLE = 'このステップの完成例';

// 一覧に出す名前。Office マクロ系の vba/ ・ gas/ は、どちらの環境かを本文で選んでいるので出さない。
// （data-file には元のパスを残す。環境の出し分けと syncEditors がそれを見る）
const displayName = (file) => file.replace(/^(vba|gas)\//, '');

function visit(node, callback) {
  if (!node || !Array.isArray(node.children)) return;
  for (const child of node.children) {
    callback(child);
    visit(child, callback);
  }
}

function el(hName, className, children, extraProps = {}) {
  return {
    type: 'element',
    data: { hName, hProperties: { className, ...extraProps } },
    children: children || [],
  };
}

function text(value) {
  return { type: 'text', value };
}

/**
 * remark-download と同じ見た目の ZIP ダウンロードボタンを作る。
 * 環境ごとの ZIP があるときは両方作り、選んでいる環境のほうだけを見せる（platform.css）。
 */
function downloadButton(zipUrl) {
  const variants = platformZips(zipUrl);
  if (variants) {
    return el('span', ['download-buttons'], variants.map((v) => singleButton(v.url, `platform-only--${v.platform}`)));
  }
  return singleButton(zipUrl);
}

function singleButton(zipUrl, extraClass) {
  return {
    type: 'element',
    data: {
      hName: 'a',
      hProperties: { className: ['download-button', ...(extraClass ? [extraClass] : [])], href: zipUrl, download: true },
    },
    children: [
      el('span', ['download-button__icon'], [], { 'aria-hidden': 'true' }),
      el('span', ['download-button__label'], [text('コードをダウンロード')]),
    ],
  };
}

/** ツリーの行の頭に置くアイコン（絵は editor.css の mask で描く） */
function icon(kind) {
  return el('span', ['editor__icon', `editor__icon--${kind}`], [], { 'aria-hidden': 'true' });
}

/** ヘッダの「全画面」ボタン。押したときの挙動は editor-client.js */
function fullscreenButton() {
  return el(
    'button',
    ['editor__fullscreen'],
    [
      el('span', ['editor__fullscreen-icon'], [], { 'aria-hidden': 'true' }),
      el('span', ['editor__fullscreen-label'], [text('全画面')]),
    ],
    { type: 'button', 'aria-pressed': 'false', title: '全画面で開く' },
  );
}

export default function remarkEditor() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== 'containerDirective') return;
      if (node.name !== NAME) return;

      const attrs = node.attributes || {};
      const zipUrl = attrs.zip;

      // コードフェンスを集め、ファイル名を取り出す。
      const codeNodes = node.children.filter((c) => c.type === 'code');
      const files = [];
      codeNodes.forEach((code, i) => {
        const m = (code.meta || '').match(FILE_META_RE);
        const name = m ? m[1] : code.lang || `file${i}`;
        const status = (code.meta || '').match(STATUS_META_RE)?.[1];
        // Expressive Code にファイル名枠を出させない。足した行の印（ins=）だけは残す
        code.meta = (code.meta || '').replace(FILE_META_RE, '').replace(STATUS_META_RE, '').trim() || null;
        files.push({ name, code, status });
      });

      // デフォルトで開くファイル（open 属性で指定）。無ければ先頭。
      let activeIndex = attrs.open ? files.findIndex((f) => f.name === attrs.open) : -1;
      if (activeIndex === -1) activeIndex = 0;

      // tree="true" のとき（積み上げ方式の handson/ 全体）は、フォルダの見出しを挟んでツリーのように並べる。
      // ファイルは並び順のまま渡ってくる（フォルダが先、同じフォルダの中は名前順）
      const tree = attrs.tree === 'true';
      const fileButtons = [];
      const shownDirs = new Set();
      files.forEach((f, i) => {
        const parts = f.name.split('/');
        if (tree) {
          for (let d = 1; d < parts.length; d++) {
            const dir = parts.slice(0, d).join('/');
            if (shownDirs.has(dir)) continue;
            shownDirs.add(dir);
            fileButtons.push(
              // フォルダの行はボタン。押すと中を開け閉めする（editor-client.js）
              el(
                'button',
                ['editor__dir'],
                [icon('chevron'), icon('folder'), el('span', ['editor__name'], [text(parts[d - 1])])],
                { type: 'button', 'data-dir': dir, 'aria-expanded': 'true', style: `--depth:${d - 1}`, title: dir },
              ),
            );
          }
        }
        fileButtons.push(
          el('button', ['editor__file', ...(i === activeIndex ? ['is-active'] : [])], [
            ...(tree ? [icon('file')] : []),
            el('span', ['editor__name'], [text(tree ? parts.at(-1) : displayName(f.name))]),
            ...(f.status ? [el('span', ['file-badge', `file-badge--${f.status}`], [text(STATUS_LABEL[f.status])])] : []),
          ], {
            type: 'button',
            'data-file': f.name,
            title: f.name,
            ...(tree ? { style: `--depth:${parts.length - 1}` } : {}),
          }),
        );
      });

      const panes = files.map((f, i) =>
        el('div', ['editor__pane', ...(i === activeIndex ? ['is-active'] : [])], [f.code], {
          'data-file': f.name,
        }),
      );

      const actions = [];
      if (zipUrl) actions.push(downloadButton(zipUrl));
      actions.push(fullscreenButton());

      const header = el('div', ['editor__header'], [
        el('span', ['editor__title'], [text(attrs.title || DEFAULT_TITLE)]),
        el('span', ['editor__actions'], actions),
      ]);
      const body = el('div', ['editor__body'], [
        el('div', ['editor__files'], fileButtons),
        el('div', ['editor__code'], panes),
      ]);

      node.type = 'editorContainer';
      node.data = { hName: 'section', hProperties: { className: ['editor', ...(tree ? ['editor--tree'] : [])] } };
      node.children = [header, body];
    });
  };
}
