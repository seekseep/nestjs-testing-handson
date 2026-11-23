"""08 章「コラム」ロンドン学派と古典学派の、2 つのテストの範囲の図。

左: ロンドン学派。SettlementService のほかは、リポジトリも計算の関数もモックにする。
右: 古典学派。外のもの（DB の手前のリポジトリ）だけを偽物にし、計算の関数は本物を使う。
スキーマ: CONTAINER（テストの範囲）+ LINK（呼び出し）。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

c = Canvas(960, 420)



def box(cx, cy, w, h, label, color, draw=None, dash="solid"):
    """図形を描き、ラベル（2 行まで）を図形の上下の中央に置く。"""
    n = (draw or c.sticky)(cx - w / 2, cy - h / 2, w, h, color=color, dash=dash)
    lines = label.count("\n")
    c.text(cx, cy + 8 - lines * 14, label, scale="label", fill=PALETTE[color]["text"])
    return n


for x0, title, color in [(20, "ロンドン学派", "orange"), (490, "古典学派", "green")]:
    c.sticky(x0, 20, 450, 380, color="gray", dash="dashed", weight="thin")
    c.text(x0 + 225, 62, title, scale="heading", fill=PALETTE[color]["text"])

# ロンドン学派: サービスだけが本物
s1 = box(245, 140, 230, 70, "SettlementService", "purple")
r1 = box(125, 330, 190, 80, "リポジトリ\nvi.fn()", "orange", dash="dashed")
k1 = box(365, 330, 190, 80, "settle.ts\nvi.mock()", "orange", dash="dashed")
c.link(s1, r1)
c.link(s1, k1)

# 古典学派: 計算は本物、リポジトリだけ偽物
s2 = box(715, 140, 230, 70, "SettlementService", "purple")
r2 = box(595, 330, 190, 80, "偽物の\nリポジトリ", "orange", dash="dashed")
k2 = box(835, 330, 190, 80, "settle.ts\n本物", "purple")
c.link(s2, r2)
c.link(s2, k2)

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
