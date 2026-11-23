"""08 章「コラム」どのテストを、どれだけ書くか のサムネイル。アイスクリームコーンからテストピラミッドへ。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

c = Canvas(960, 400)


def box(cx, cy, w, h, label, color, draw=None, dash="solid"):
    """図形を描き、ラベル（2 行まで）を図形の上下の中央に置く。"""
    n = (draw or c.sticky)(cx - w / 2, cy - h / 2, w, h, color=color, dash=dash)
    lines = label.count("\n")
    c.text(cx, cy + 8 - lines * 14, label, scale="label", fill=PALETTE[color]["text"])
    return n


# 左: アイスクリームコーン（上ほど多い）。右: テストピラミッド（下ほど多い）
cone = [("手動", "gray", 300), ("E2E", "blue", 250), ("結合", "orange", 170), ("単体", "pink", 100)]
for i, (label, color, w) in enumerate(cone):
    box(230, 160 + i * 52, w, 44, label, color)
c.triangle(190, 342, 80, 66, color="yellow", direction="down")
pyramid = [("E2E", "blue", 100), ("結合", "orange", 190), ("単体", "pink", 300)]
for i, (label, color, w) in enumerate(pyramid):
    box(740, 212 + i * 52, w, 44, label, color)
c.link((410, 270), (570, 270))

# 絵のある範囲（x, y, 幅, 高さ）。文字の見出しは置かず、絵を枠の上下左右の真ん中に寄せて少し大きくする
BOX = (70, 130, 820, 285)


def save_centered(path):
    x, y, w, h = BOX
    k = min(960 * 0.9 / w, 400 * 0.85 / h, 1.4)
    tx, ty = 480 - k * (x + w / 2), 200 - k * (y + h / 2)
    c.check()
    svg = c.svg()
    bg = '<rect x="0" y="0" width="960" height="400" fill="#ffffff"/>'
    head, body = svg.split(bg, 1)
    body = "</g>\n</svg>".join(body.rsplit("</svg>", 1))  # 最後の </svg> の前で閉じる（絵文字の中にも <svg> がある）
    with open(path, "w") as f:
        f.write(head + bg + f'\n<g transform="translate({tx:.1f} {ty:.1f}) scale({k:.3f})">' + body)


save_centered(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
