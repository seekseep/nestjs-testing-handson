"""02-02「リクエストの流れ」の図。3 枚とも同じ構図（画面・エンドポイント・ロジック・DB の 4 列）。

STAGE だけを図ごとに変える（members / payments / settlement）。
その処理で通る箱と矢印だけに色を付け、使わないものは灰色にする。
スキーマ: SOURCE-PATH-GOAL（画面 → コントローラー → DB）+ CYCLE（清算を返す）。
"""

import os
import sys

sys.path.insert(0, os.path.expanduser("~/.claude/skills/genfig"))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

STAGE = "payments"

ROWS = {"members": 120, "payments": 250, "settlement": 380}
ROUTES = {"members": "POST /members", "payments": "POST /payments",
          "settlement": "GET /settlement"}

c = Canvas(960, 600)


def box(cx, cy, w, h, label, color, draw=None):
    """図形を描き、ラベル（2 行まで）を図形の上下の中央に置く。"""
    n = (draw or c.sticky)(cx - w / 2, cy - h / 2, w, h, color=color)
    lines = label.count("\n")
    c.text(cx, cy + 8 - lines * 14, label, scale="label", fill=PALETTE[color]["text"])
    return n


def on(keys, color):
    return color if STAGE in keys else "gray"


# 列の見出し
for x, title in [(90, "画面"), (330, "エンドポイント"), (590, "ロジック"), (850, "DB")]:
    c.text(x, 40, title, scale="heading")

screen = c.node(90, 380, "画面", emoji_cp="1f5a5", w=110, h=90, label_scale="label")  # 🖥️

ctrl = {}
for key, y in ROWS.items():
    name = key.capitalize() + "\nController"
    ctrl[key] = box(330, y, 180, 80, name, on([key], "teal"))
    c.text(330, ctrl[key].bottom + 26, ROUTES[key], scale="body",
           fill=PALETTE[on([key], "teal")]["text"])

logic = box(590, 515, 190, 110, "split\n→ balances\n→ settle", on(["settlement"], "purple"),
            draw=c.hexagon)

tables = {
    "members": c.node(850, ROWS["members"], "members", shape="cylinder",
                      color=on(["members"], "green"), w=170, h=90, label_scale="label"),
    "payments": c.node(850, ROWS["payments"], "payments", shape="cylinder",
                       color=on(["payments", "settlement"], "green"), w=170, h=90,
                       label_scale="label"),
    "participants": c.node(850, ROWS["settlement"], "payment_\nparticipants",
                           shape="cylinder", color=on(["payments", "settlement"], "green"),
                           w=170, h=100, label_scale="label"),
}

if STAGE == "members":
    c.link(screen, ctrl["members"], label="HTTP", route="elbow", start="n", end="w")
    c.link(ctrl["members"], tables["members"], label="SQL で書く")
elif STAGE == "payments":
    c.link(screen, ctrl["payments"], label="HTTP", route="elbow", start="n", end="w")
    c.link(ctrl["payments"], tables["payments"], label="SQL で書く")
    c.link(ctrl["payments"], tables["participants"])
else:
    c.link(screen, ctrl["settlement"], label="① HTTP", offset=18)
    c.link(ctrl["settlement"], tables["participants"], label="② SQL で読む")
    c.link(ctrl["settlement"], tables["payments"])
    c.link(ctrl["settlement"], logic, label="③ 計算", label_pos="below")
    c.link(ctrl["settlement"], screen, label="④ 清算", offset=18, primary=False,
           label_pos="below")

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
