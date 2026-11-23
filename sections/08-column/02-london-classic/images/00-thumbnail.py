"""08 章「コラム」ロンドン学派と古典学派 のサムネイル。偽物だらけ（ロンドン）と、本物でつなぐ（古典）の対比。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

c = Canvas(960, 400)
c.text(40, 52, "コラム", scale="label", align="left", fill=PALETTE["gray"]["text"])
c.text(40, 92, "ロンドン学派と古典学派", scale="title", align="left")


def box(cx, cy, w, h, label, color, draw=None, dash="solid"):
    """図形を描き、ラベル（2 行まで）を図形の上下の中央に置く。"""
    n = (draw or c.sticky)(cx - w / 2, cy - h / 2, w, h, color=color, dash=dash)
    lines = label.count("\n")
    c.text(cx, cy + 8 - lines * 14, label, scale="label", fill=PALETTE[color]["text"])
    return n


c.text(240, 150, "ロンドン学派", scale="heading", fill=PALETTE["orange"]["text"])
c.text(720, 150, "古典学派", scale="heading", fill=PALETTE["green"]["text"])
a = box(240, 220, 170, 60, "確かめるクラス", "purple")
f1 = box(150, 330, 150, 56, "偽物", "orange", dash="dashed")
f2 = box(330, 330, 150, 56, "偽物", "orange", dash="dashed")
c.link(a, f1)
c.link(a, f2)
b = box(600, 220, 170, 60, "確かめるクラス", "purple")
r = box(820, 220, 150, 60, "本物", "purple")
f3 = box(820, 330, 150, 56, "外だけ偽物", "orange", dash="dashed")
c.link(b, r)
c.link(r, f3)

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
