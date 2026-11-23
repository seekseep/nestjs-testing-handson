"""02-02「リクエストの流れ」の図。3 枚とも列（画面・エンドポイント・ロジック・DB）の位置をそろえる。

STAGE だけを図ごとに変える（members / payments / settlement）。
その処理で通るものだけを描き、中身の無い列は見出しごと出さない（列の位置は詰めない）。
スキーマ: SOURCE-PATH-GOAL（画面 → コントローラー → DB）+ CYCLE（清算を返す）。
"""

import os
import sys

sys.path.insert(0, os.path.expanduser("~/.claude/skills/genfig"))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

STAGE = "payments"

ROUTES = {"members": "POST /members", "payments": "POST /payments",
          "settlement": "GET /settlement"}
HEIGHTS = {"members": 260, "payments": 345, "settlement": 650}
Y = 150  # 画面とコントローラーの高さ

c = Canvas(960, HEIGHTS[STAGE])


def box(cx, cy, w, h, label, color, draw=None):
    """図形を描き、ラベル（2 行まで）を図形の上下の中央に置く。"""
    n = (draw or c.sticky)(cx - w / 2, cy - h / 2, w, h, color=color)
    lines = label.count("\n")
    c.text(cx, cy + 8 - lines * 14, label, scale="label", fill=PALETTE[color]["text"])
    return n


def table(cy, label, h=90):
    return c.node(850, cy, label, shape="cylinder", color="green", w=170, h=h,
                  label_scale="label")


# 列の見出し（中身のある列だけ。位置はどの図でも同じ）
columns = [(90, "画面"), (330, "エンドポイント"), (850, "DB")]
if STAGE == "settlement":
    columns.insert(2, (590, "ロジック"))
for x, title in columns:
    c.text(x, 40, title, scale="heading")

screen = c.node(90, Y, "画面", emoji_cp="1f5a5", w=110, h=90, label_scale="label")  # 🖥️
name = STAGE.capitalize() + "\nController"
ctrl = box(330, Y, 180, 80, name, "teal")
c.text(330, ctrl.top - 14, ROUTES[STAGE], scale="body", fill=PALETTE["teal"]["text"])

if STAGE == "members":
    members = table(Y, "members")
    c.link(screen, ctrl, label="HTTP")
    c.link(ctrl, members, label="SQL で書く")
elif STAGE == "payments":
    payments = table(Y, "payments")
    participants = table(Y + 130, "payment_\nparticipants", h=100)
    c.link(screen, ctrl, label="HTTP")
    c.link(ctrl, payments, label="SQL で書く")
    c.link(ctrl, participants)
else:
    payments = table(Y, "payments")
    participants = table(Y + 130, "payment_\nparticipants", h=100)
    # ロジックは 3 つの関数。上から順に計算が進む
    funcs = {}
    for i, (key, note) in enumerate([("split", "1 人分ずつに分ける"),
                                     ("balances", "一人ずつの差し引きを出す"),
                                     ("settle", "だれがだれに払うか決める")]):
        cy = Y + 200 + i * 120
        funcs[key] = box(590, cy, 170, 70, key, "purple", draw=c.hexagon)
        c.text(690, cy + 6, note, scale="body", align="left", fill=PALETTE["purple"]["text"])
    c.link(screen, ctrl, label="① HTTP", offset=18)
    c.link(ctrl, payments, label="② SQL で読む")
    c.link(ctrl, participants)
    c.link(ctrl, funcs["split"], label="③ 計算する", route="elbow", start="s", end="w")
    c.link(funcs["split"], funcs["balances"])
    c.link(funcs["balances"], funcs["settle"])
    c.link(funcs["settle"], (ctrl, "sw"), label="④ 結果", route="elbow", start="w",
           primary=False)
    c.link(ctrl, screen, label="⑤ 清算", offset=18, primary=False, label_pos="below")

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
