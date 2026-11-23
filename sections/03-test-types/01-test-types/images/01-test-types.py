"""03-01「テストの種類」の図。README の「このハンズオンで作るもの」でも使う。

ユーザー（画面）→ コントローラー → ロジック → DB の 4 つを横に並べ、
各テストが動かす範囲を入れ子の枠で囲む（E2E がいちばん外、その中に結合、その中に単体）。
スキーマ: SOURCE-PATH-GOAL（4 つのコンポーネント）+ CONTAINER（入れ子の範囲）。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

c = Canvas(960, 420)
Y = 285  # コンポーネントの高さ


def scope(x, y, w, h, name, color):
    """テストの範囲の枠と、左上の角のラベル。"""
    c.sticky(x, y, w, h, color=color, weight="thin")
    c.text(x + 18, y + 32, name, scale="label", align="left", fill=PALETTE[color]["text"])


scope(20, 20, 920, 380, "E2E テスト", "blue")
scope(250, 80, 670, 300, "結合テスト", "orange")
scope(500, 140, 200, 220, "単体テスト", "pink")

user = c.node(130, Y, "ユーザー（画面）", emoji_cp="1f9d1", w=110, h=90,  # 🧑
              label_scale="label")
ctrl = c.node(375, Y, "コントローラー", shape="square", color="teal", w=180, h=80,
              label_scale="label")
logic = c.node(600, Y, "ロジック", shape="hexagon", color="purple", w=150, h=80,
               label_scale="label")
db = c.node(830, Y, "DB", shape="cylinder", color="green", w=130, h=90,
            label_scale="label")

c.link(user, ctrl)
c.link(ctrl, logic)
c.link(logic, db)

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
