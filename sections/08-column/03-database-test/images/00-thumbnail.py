"""08 章「コラム」データベースのテストはしないのか のサムネイル。DB の円柱と、テストごとの一時ファイル。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

c = Canvas(960, 400)
c.text(40, 52, "コラム", scale="label", align="left", fill=PALETTE["gray"]["text"])
c.text(40, 92, "データベースのテストはしないのか", scale="title", align="left")


def box(cx, cy, w, h, label, color, draw=None, dash="solid"):
    """図形を描き、ラベル（2 行まで）を図形の上下の中央に置く。"""
    n = (draw or c.sticky)(cx - w / 2, cy - h / 2, w, h, color=color, dash=dash)
    lines = label.count("\n")
    c.text(cx, cy + 8 - lines * 14, label, scale="label", fill=PALETTE[color]["text"])
    return n


test = c.node(170, 270, "テスト", emoji_cp="1f9ea", w=110, h=100, label_scale="label")  # 🧪
db = c.node(480, 270, "DB\n一時ファイル", shape="cylinder", color="green", w=190, h=120,
            label_scale="label")
trash = c.node(790, 270, "終わったら消す", emoji_cp="1f5d1", w=110, h=100, label_scale="label")  # 🗑️
c.link(test, db, label="本物で確かめる")
c.link(db, trash, primary=False)

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
