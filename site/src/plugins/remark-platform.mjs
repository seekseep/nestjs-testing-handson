/**
 * `:::::platform` コンテナディレクティブを、OS（macOS / Windows / Linux）ごとのパネルに変換する remark プラグイン。
 *
 * 手順やコマンドが OS で分かれるところだけをこのコンテナで囲む。
 *
 * 使い方（Markdown）:
 *   :::::platform
 *   ::::macos
 *   macOS での手順
 *   ::::
 *   ::::macos-linux
 *   macOS と Linux で共通の手順（OS 名を - でつなぐと、どれを選んでいても出す）
 *   ::::
 *   :::::
 *
 * どれを表示するかは、ナビゲーションバーの選択欄（src/components/ThemeSelect.astro）と
 * `::platform-choice` のボタンで決め、localStorage に残す（src/scripts/platform-client.js）。
 * 表示の出し分けは site/src/styles/platform.css。
 */

const NAME = 'platform';
const OSES = ['macos', 'windows', 'linux'];

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

// `::platform-choice` … OS を選ぶ大きなボタン（進め方のページなどに置く）。
// ナビゲーションバーの選択欄と同じ働きで、押すと platform-client.js が全ページを切り替える。
const CHOICE = 'platform-choice';
const CHOICES = [
  { key: 'macos', name: 'macOS', desc: 'Apple Silicon / Intel の Mac。ターミナルで進める' },
  { key: 'windows', name: 'Windows', desc: 'Windows 11。PowerShell 7 で進める' },
  { key: 'linux', name: 'Linux', desc: 'Ubuntu など。ふだんのシェルで進める（手順は apt で書いている）' },
];

function choiceNode(node) {
  const options = CHOICES.map((c) =>
    el('button', ['platform-choice__option', `platform-choice__option--${c.key}`], [
      el('span', ['platform-choice__name'], [{ type: 'text', value: c.name }]),
      el('span', ['platform-choice__desc'], [{ type: 'text', value: c.desc }]),
    ], { type: 'button', 'data-platform': c.key }),
  );
  node.type = 'platformChoice';
  node.data = { hName: 'div', hProperties: { className: ['platform-choice', 'not-content'], role: 'group', 'aria-label': 'お使いの OS' } };
  node.children = options;
}

// `::::macos-linux` → ['macos', 'linux']。知らない名前は捨てる。
function osesOf(name) {
  return name.split('-').filter((n) => OSES.includes(n));
}

export default function remarkPlatform() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'leafDirective' && node.name === CHOICE) {
        choiceNode(node);
        return;
      }
      if (node.type !== 'containerDirective' || node.name !== NAME) return;

      const panels = node.children
        .filter((c) => c.type === 'containerDirective' && osesOf(c.name).length > 0)
        .map((c) =>
          el('div', ['platform__panel', ...osesOf(c.name).map((os) => `platform__panel--${os}`)], c.children),
        );
      if (panels.length === 0) return;

      node.type = 'platformContainer';
      node.data = { hName: 'div', hProperties: { className: ['platform'] } };
      node.children = panels;
    });
  };
}
