"""08 章「コラム」どのテストを、どれだけ書くか のサムネイル。下ほど多い、テストのピラミッド。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

c = Canvas(960, 400)
c.text(40, 52, "コラム", scale="label", align="left", fill=PALETTE["gray"]["text"])
c.text(40, 92, "どのテストを、どれだけ書くか", scale="title", align="left")


def box(cx, cy, w, h, label, color, draw=None, dash="solid"):
    """図形を描き、ラベル（2 行まで）を図形の上下の中央に置く。"""
    n = (draw or c.sticky)(cx - w / 2, cy - h / 2, w, h, color=color, dash=dash)
    lines = label.count("\n")
    c.text(cx, cy + 8 - lines * 14, label, scale="label", fill=PALETTE[color]["text"])
    return n


box(480, 190, 200, 50, "E2E", "blue")
box(480, 255, 380, 50, "結合", "orange")
box(480, 320, 560, 50, "単体", "pink")
c.text(800, 195, "少なく・遅い", scale="body", align="left", fill=PALETTE["gray"]["text"])
c.text(800, 325, "多く・速い", scale="body", align="left", fill=PALETTE["gray"]["text"])

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
