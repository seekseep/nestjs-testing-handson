/**
 * `::::cards` と `:::card` のコンテナディレクティブを、カードの一覧に変換する remark プラグイン。
 * カード 1 枚がまるごと 1 つのリンク（<a class="card">）になる。見た目は site/src/styles/cards.css。
 *
 * 使い方（Markdown）:
 *   ::::cards
 *   :::card
 *   ![サムネイルの説明](../01-tdd/images/00-thumbnail.svg)
 *
 *   [テスト駆動開発と自動テスト](../01-tdd/LECTURE.md)
 *
 *   説明の文。
 *   :::
 *   ::::
 *
 * - 画像とリンクはふつうの Markdown で書くので、sync-lectures.mjs がほかの本文と同じく
 *   サイトの URL に直し、GitHub で開いても画像とリンクが読める
 * - カードの行き先は、中の最初のリンク。リンクは文字だけにしてカードの題にする（<a> の入れ子を避ける）
 * - 題は見出し（h タグ）にしないので、ページの目次には出ない
 */

function visit(node, callback) {
  if (!node || !Array.isArray(node.children)) return;
  for (const child of node.children) {
    callback(child);
    visit(child, callback);
  }
}

function findLink(node) {
  if (node.type === 'link') return node;
  for (const child of node.children ?? []) {
    const found = findLink(child);
    if (found) return found;
  }
  return null;
}

const hasImage = (p) => p.type === 'paragraph' && p.children.some((c) => c.type === 'image');

export default function remarkCards() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== 'containerDirective') return;
      if (node.name === 'cards') {
        node.type = 'cardsContainer';
        node.data = { hName: 'div', hProperties: { className: ['cards'] } };
        return;
      }
      if (node.name !== 'card') return;

      const link = findLink(node);
      if (!link) return;

      const children = [];
      for (const child of node.children) {
        if (hasImage(child)) {
          children.push({ ...child, data: { hName: 'div', hProperties: { className: ['card__image'] } } });
        } else if (findLink(child) === link) {
          // 題のリンクは文字だけにして、カード全体のリンクに任せる
          children.push({
            type: 'paragraph',
            data: { hName: 'span', hProperties: { className: ['card__title'] } },
            children: link.children,
          });
        } else {
          children.push({ ...child, data: { hName: 'span', hProperties: { className: ['card__desc'] } } });
        }
      }
      node.type = 'cardContainer';
      node.children = children;
      node.data = { hName: 'a', hProperties: { className: ['card'], href: link.url } };
    });
  };
}
