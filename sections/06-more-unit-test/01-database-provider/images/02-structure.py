"""06 章「もっと単体テスト」の構成図。どの節でも同じ構図で、3 つのコントローラーから部品が分かれていく。

STAGE だけを節ごとに変える（start / db / repository / service）。
その節で分けたものに色を付け、前の節までに分けたものは灰色にする。
スキーマ: CONTAINER（AppModule・DatabaseModule・コントローラー）+ SPLITTING（取り出す）+ LINK（注入）。
"""

import os
import sys

sys.path.insert(0, os.path.expanduser("~/.claude/skills/genfig"))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

STAGE = "db"

ORDER = ["db", "repository", "service"]
moved = [] if STAGE == "start" else ORDER[: ORDER.index(STAGE) + 1]


def color_of(key, color):
    return color if key == STAGE else "gray"


def remaining(extra):
    """コントローラーの中に残っている仕事。"""
    items = []
    if "db" not in moved:
        items.append("DB を開く")
    if "repository" not in moved:
        items.append("SQL")
    if extra and "service" not in moved:
        items.append("清算")
    return "・".join(items)


c = Canvas(960, 540)

# AppModule（いつも全体を包む）
c.sticky(20, 20, 920, 500, color="gray", dash="dashed", weight="thin")
c.text(44, 56, "AppModule", scale="heading", align="left")

# コントローラー（いつも同じ位置・大きさ）
ctrls = {}
for i, (key, name) in enumerate([("members", "MembersController"),
                                  ("payments", "PaymentsController"),
                                  ("settlement", "SettlementController")]):
    top = 76 + i * 146
    ctrls[key] = c.sticky(36, top, 320, 132, color="teal", weight="thick")
    c.text(56, top + 34, name, scale="label", align="left", fill=PALETTE["teal"]["text"])
    c.node(196, top + 70, "受け取って返す", shape="square", color="gray", w=290, h=34,
           label_scale="label")
    rest = remaining(key == "settlement")
    if rest:
        c.node(196, top + 108, rest, shape="square", color="gray", w=290, h=34,
               label_scale="label")

# 分けたもの（いつも同じ位置）
nodes = {}


def box(cx, cy, label, color, draw=None, w=220, h=96):
    """2 行のラベルを図形の上下の中央に置く。"""
    n = (draw or c.sticky)(cx - w / 2, cy - h / 2, w, h, color=color)
    c.text(cx, cy - 4, label, scale="label", fill=PALETTE[color]["text"])
    return n


if "db" in moved:
    db_color = color_of("db", "green")
    c.sticky(696, 200, 236, 196, color=db_color, weight="thick")
    c.text(712, 232, "DatabaseModule", scale="label", align="left")
    nodes["db"] = c.node(814, 316, "DatabaseSync", shape="cylinder", color=db_color,
                         w=180, h=110, label_scale="label")
if "repository" in moved:
    color = color_of("repository", "orange")
    nodes["members"] = box(540, 142, "Members\nRepository", color)
    nodes["payments"] = box(540, 288, "Payments\nRepository", color)
if "service" in moved:
    nodes["service"] = box(540, 434, "Settlement\nService", color_of("service", "purple"),
                           draw=c.hexagon)

# 注入
if "db" in nodes:
    if "members" in nodes:
        c.link(nodes["db"], nodes["members"], label="注入", start="w")
        c.link(nodes["db"], nodes["payments"], start="w")
    else:
        for key in ctrls:
            c.link(nodes["db"], (ctrls[key].right, ctrls[key].cy), start="w",
                   label="注入" if key == "payments" else None)
if "members" in nodes:
    c.link(nodes["members"], (ctrls["members"].right, ctrls["members"].cy))
    c.link(nodes["payments"], (ctrls["payments"].right, ctrls["payments"].cy))
    if "service" in nodes:
        c.link(nodes["payments"], nodes["service"])
        c.link(nodes["service"], (ctrls["settlement"].right, ctrls["settlement"].cy))
    else:
        c.link(nodes["payments"], (ctrls["settlement"].right, ctrls["settlement"].cy))

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
