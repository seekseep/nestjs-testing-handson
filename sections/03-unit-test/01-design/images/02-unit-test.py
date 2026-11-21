"""03-01「単体テストのしくみ」の図。

テストのコードが関数に入力を渡し、返ってきた結果を期待する結果と比べる。DB も HTTP も通らない。
スキーマ: SOURCE-PATH-GOAL（入力 → 関数 → 結果）+ BALANCE（結果と期待を比べる）。
"""

import os
import sys

sys.path.insert(0, os.path.expanduser("~/.claude/skills/genfig"))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

c = Canvas(960, 420)


def box(cx, cy, w, h, label, color, draw=None):
    """図形を描き、ラベル（2 行まで）を図形の上下の中央に置く。"""
    n = (draw or c.sticky)(cx - w / 2, cy - h / 2, w, h, color=color)
    lines = label.count("\n")
    c.text(cx, cy + 8 - lines * 14, label, scale="label", fill=PALETTE[color]["text"])
    return n


c.sticky(20, 20, 920, 380, color="gray", dash="dashed", weight="thin")
c.text(44, 60, "テストのコード（settle.spec.ts）", scale="heading", align="left")

given = box(160, 160, 240, 100, "入力\nsplit(10000, 3)", "blue", draw=c.parallelogram)
func = box(460, 160, 170, 100, "split\n（settle.ts）", "purple", draw=c.hexagon)
result = box(770, 160, 270, 100, "結果\n[3334, 3333, 3333]", "teal")
expected = box(770, 320, 270, 100, "期待する結果\n[3334, 3333, 3333]", "yellow")

c.link(given, func, label="渡す")
c.link(func, result, label="返す")
c.link(result, expected, label="toEqual で比べる", both=True)

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
