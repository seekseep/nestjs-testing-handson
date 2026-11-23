"""08 章「コラム」テスト駆動開発と自動テスト のサムネイル。レッド → グリーン → リファクタリングの輪。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

c = Canvas(960, 400)
c.text(40, 52, "コラム", scale="label", align="left", fill=PALETTE["gray"]["text"])
c.text(40, 92, "テスト駆動開発と自動テスト", scale="title", align="left")


def box(cx, cy, w, h, label, color, draw=None, dash="solid"):
    """図形を描き、ラベル（2 行まで）を図形の上下の中央に置く。"""
    n = (draw or c.sticky)(cx - w / 2, cy - h / 2, w, h, color=color, dash=dash)
    lines = label.count("\n")
    c.text(cx, cy + 8 - lines * 14, label, scale="label", fill=PALETTE[color]["text"])
    return n


red = c.node(230, 270, "レッド\n落ちるテストを書く", shape="ellipse", color="red", w=230, h=100, label_scale="label")
green = c.node(520, 270, "グリーン\n通るように書く", shape="ellipse", color="green", w=230, h=100, label_scale="label")
refactor = c.node(800, 270, "リファクタリング\n整える", shape="ellipse", color="blue", w=230, h=100, label_scale="label")
c.link(red, green)
c.link(green, refactor)
c.link(refactor, red, route="elbow", start="s", end="s", primary=False, label="くり返す")

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
