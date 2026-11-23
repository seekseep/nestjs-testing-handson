"""08 章「コラム」防御的プログラミングと攻撃的プログラミングの、境界で確かめる図。

外から入る値を、境界（コントローラー）で確かめ、おかしければ 400 で断る。
中の split・balances・settle は、確かめ済みの値が来るものとして書く。
スキーマ: CONTAINER（内側）+ BLOCKAGE（境界で断る）+ SOURCE-PATH-GOAL。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

c = Canvas(960, 380)


def box(cx, cy, w, h, label, color, draw=None, dash="solid"):
    """図形を描き、ラベル（2 行まで）を図形の上下の中央に置く。"""
    n = (draw or c.sticky)(cx - w / 2, cy - h / 2, w, h, color=color, dash=dash)
    lines = label.count("\n")
    c.text(cx, cy + 8 - lines * 14, label, scale="label", fill=PALETTE[color]["text"])
    return n


screen = c.node(90, 170, "画面", emoji_cp="1f5a5", w=110, h=90, label_scale="label")  # 🖥️
ctrl = box(330, 170, 200, 100, "コントローラー\n境界で確かめる", "teal")
c.sticky(480, 40, 460, 260, color="gray", dash="dashed", weight="thin")
c.text(710, 80, "内側（確かめ済みの値を信じる）", scale="label", fill=PALETTE["gray"]["text"])
logic = box(710, 170, 360, 100, "split・balances・settle", "purple", draw=c.hexagon)
ng = box(330, 330, 200, 56, "400 で断る", "red")

c.link(screen, ctrl, label="入力")
c.link(ctrl, logic)
c.link(ctrl, ng, label="おかしな値")

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
