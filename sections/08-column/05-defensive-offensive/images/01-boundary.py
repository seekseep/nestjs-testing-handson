"""08 章「コラム」防御的プログラミングと攻撃的プログラミングの、境界で確かめる図。

外から入る値を、境界（コントローラー）で確かめ、おかしければ 400 で断る。
中の split → balances → settle は、確かめ済みの値が来るものとして書く。
スキーマ: CONTAINER（内側）+ BLOCKAGE（境界で断る）+ SOURCE-PATH-GOAL。
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


screen = c.node(90, 190, "画面", emoji_cp="1f5a5", w=110, h=90, label_scale="label")  # 🖥️
ctrl = box(330, 190, 200, 100, "コントローラー\n境界で確かめる", "teal")
c.sticky(500, 20, 440, 360, color="gray", dash="dashed", weight="thin")
c.text(720, 58, "内側（確かめ済みの値を信じる）", scale="label", fill=PALETTE["gray"]["text"])
funcs = [box(720, 130 + i * 95, 190, 62, name, "purple", draw=c.hexagon)
         for i, name in enumerate(["split", "balances", "settle"])]
ng = box(330, 340, 200, 56, "400 で断る", "red")

c.link(screen, ctrl, label="入力")
c.link(ctrl, funcs[0], route="elbow", start="e", end="w")
c.link(funcs[0], funcs[1])
c.link(funcs[1], funcs[2])
c.link(ctrl, ng, label="おかしな値")

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
