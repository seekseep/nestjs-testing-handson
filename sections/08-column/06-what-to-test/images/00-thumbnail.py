"""08 章「コラム」何をテストするか のサムネイル。外から見える振る舞いを確かめ、中の作り方は見ない。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

c = Canvas(960, 400)
c.text(40, 52, "コラム", scale="label", align="left", fill=PALETTE["gray"]["text"])
c.text(40, 92, "何をテストするか", scale="title", align="left")


def box(cx, cy, w, h, label, color, draw=None, dash="solid"):
    """図形を描き、ラベル（2 行まで）を図形の上下の中央に置く。"""
    n = (draw or c.sticky)(cx - w / 2, cy - h / 2, w, h, color=color, dash=dash)
    lines = label.count("\n")
    c.text(cx, cy + 8 - lines * 14, label, scale="label", fill=PALETTE[color]["text"])
    return n


inp = box(170, 270, 170, 70, "入力", "blue", draw=c.parallelogram)
blk = box(480, 270, 230, 120, "中の作り方\nは見ない", "gray")
out = box(790, 270, 170, 70, "結果", "green")
c.link(inp, blk)
c.link(blk, out)
c.text(480, 375, "確かめるのは、入力に対する結果（振る舞い）", scale="label", fill=PALETTE["green"]["text"])

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
