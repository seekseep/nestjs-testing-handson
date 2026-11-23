"""08 章「コラム」テストダブルの種類 のサムネイル。本物の代わりに渡す、5 つの偽物。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

c = Canvas(960, 400)
c.text(40, 52, "コラム", scale="label", align="left", fill=PALETTE["gray"]["text"])
c.text(40, 92, "テストダブルの種類", scale="title", align="left")


def box(cx, cy, w, h, label, color, draw=None, dash="solid"):
    """図形を描き、ラベル（2 行まで）を図形の上下の中央に置く。"""
    n = (draw or c.sticky)(cx - w / 2, cy - h / 2, w, h, color=color, dash=dash)
    lines = label.count("\n")
    c.text(cx, cy + 8 - lines * 14, label, scale="label", fill=PALETTE[color]["text"])
    return n


for i, (name, color, note) in enumerate([("ダミー", "gray", "渡すだけ"),
                                         ("スタブ", "yellow", "決まった値を返す"),
                                         ("スパイ", "teal", "呼ばれ方を残す"),
                                         ("モック", "pink", "呼ばれ方を確かめる"),
                                         ("フェイク", "orange", "簡単な本物")]):
    box(110 + i * 185, 250, 160, 80, name, color, dash="dashed")
    c.text(110 + i * 185, 325, note, scale="body", fill=PALETTE[color]["text"])

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
