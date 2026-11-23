"""08 章「コラム」防御的プログラミングと攻撃的プログラミング のサムネイル。どこでも確かめる盾と、すぐ止める標識。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

c = Canvas(960, 400)
c.text(40, 52, "コラム", scale="label", align="left", fill=PALETTE["gray"]["text"])
c.text(40, 92, "防御的プログラミングと攻撃的プログラミング", scale="title", align="left")


def box(cx, cy, w, h, label, color, draw=None, dash="solid"):
    """図形を描き、ラベル（2 行まで）を図形の上下の中央に置く。"""
    n = (draw or c.sticky)(cx - w / 2, cy - h / 2, w, h, color=color, dash=dash)
    lines = label.count("\n")
    c.text(cx, cy + 8 - lines * 14, label, scale="label", fill=PALETTE[color]["text"])
    return n


shield = c.node(250, 270, "防御的\nどこでも確かめる", emoji_cp="1f6e1", w=120, h=100, label_scale="label")
stop = c.node(710, 270, "攻撃的\nおかしければすぐ止める", emoji_cp="1f6d1", w=120, h=100, label_scale="label")
c.text(480, 280, "↔", scale="title", fill=PALETTE["gray"]["text"])

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
