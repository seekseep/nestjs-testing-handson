"""08 章「コラム」不安定なテストと扱いにくいもの のサムネイル。同じコードなのに、通ったり落ちたりする。
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


c.text(375, 200, "同じコードなのに", scale="label", fill=PALETTE["gray"]["text"])
for i, (mark, color) in enumerate([("通る", "green"), ("落ちる", "red"), ("通る", "green"), ("落ちる", "red")]):
    c.node(150 + i * 150, 270, mark, shape="ellipse", color=color, w=120, h=80, label_scale="label")
c.node(780, 270, "時刻", emoji_cp="1f552", w=90, h=90, label_scale="label")
c.node(890, 270, "乱数", emoji_cp="1f3b2", w=90, h=90, label_scale="label")

# 絵のある範囲（x, y, 幅, 高さ）。文字の見出しは置かず、絵を枠の上下左右の真ん中に寄せて少し大きくする
BOX = (85, 180, 855, 165)


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
