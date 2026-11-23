"""08 章「コラム」自動テストの運用 のサムネイル。push のたびに CI で流し、通ったものだけマージする。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

c = Canvas(960, 400)
c.text(40, 52, "コラム", scale="label", align="left", fill=PALETTE["gray"]["text"])
c.text(40, 92, "自動テストの運用", scale="title", align="left")


def box(cx, cy, w, h, label, color, draw=None, dash="solid"):
    """図形を描き、ラベル（2 行まで）を図形の上下の中央に置く。"""
    n = (draw or c.sticky)(cx - w / 2, cy - h / 2, w, h, color=color, dash=dash)
    lines = label.count("\n")
    c.text(cx, cy + 8 - lines * 14, label, scale="label", fill=PALETTE[color]["text"])
    return n


push = c.node(130, 270, "push・PR", emoji_cp="1f4e4", w=110, h=100, label_scale="label")
ci = box(420, 270, 200, 90, "CI で\nテストを流す", "blue", draw=c.hexagon)
ok = box(760, 210, 200, 64, "通る → マージ", "green")
ng = box(760, 330, 200, 64, "落ちる → 直す", "red")
c.link(push, ci)
c.link(ci, ok)
c.link(ci, ng)

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
