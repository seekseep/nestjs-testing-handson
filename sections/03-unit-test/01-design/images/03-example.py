"""03-01「割り勘の例の金額の動き」の図。

A が 3 人分の 10,000 円を立て替えたとき、split → balances → settle で金額がどう変わるか。
スキーマ: SOURCE-PATH-GOAL（上から下へ、関数を通るたびに形が変わる）。
"""

import os
import sys

sys.path.insert(0, os.path.expanduser("~/.claude/skills/genfig"))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

c = Canvas(960, 330)


def box(cx, cy, w, h, label, color, draw=None):
    """図形を描き、ラベル（4 行まで）を図形の上下の中央に置く。"""
    n = (draw or c.sticky)(cx - w / 2, cy - h / 2, w, h, color=color)
    lines = label.count("\n")
    c.text(cx, cy + 8 - lines * 14, label, scale="label", fill=PALETTE[color]["text"])
    return n


Y = 200
payment = box(110, Y, 190, 170, "立て替え\nA が 10,000 円\n対象 A・B・C", "blue")
shares = box(365, Y, 170, 170, "負担する額\nA 3,334\nB 3,333\nC 3,333", "yellow")
totals = box(610, Y, 170, 170, "差し引き\nA +6,666\nB −3,333\nC −3,333", "orange")
transfers = box(855, Y, 180, 170, "清算\nB → A 3,333\nC → A 3,333", "green")

c.text(242, 80, "split", scale="heading", fill=PALETTE["purple"]["text"])
c.text(487, 80, "balances", scale="heading", fill=PALETTE["purple"]["text"])
c.text(732, 80, "settle", scale="heading", fill=PALETTE["purple"]["text"])
c.link(payment, shares)
c.link(shares, totals)
c.link(totals, transfers)

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
