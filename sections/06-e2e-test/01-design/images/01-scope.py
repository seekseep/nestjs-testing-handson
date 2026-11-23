"""結合テスト（05 章）と E2E テスト（06 章）の範囲の図。2 枚とも同じ構図。

STAGE だけを図ごとに変える（integration / e2e）。
テストが動かすもの（範囲）を色付きの枠で囲み、範囲の外は灰色にする。
スキーマ: SOURCE-PATH-GOAL（テスト → 画面 → エンドポイント → ロジック → DB）+ CONTAINER（範囲）。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

STAGE = "e2e"

c = Canvas(960, 470)


def box(cx, cy, w, h, label, color, draw=None):
    """図形を描き、ラベル（2 行まで）を図形の上下の中央に置く。"""
    n = (draw or c.sticky)(cx - w / 2, cy - h / 2, w, h, color=color)
    lines = label.count("\n")
    c.text(cx, cy + 8 - lines * 14, label, scale="label", fill=PALETTE[color]["text"])
    return n


Y = 330
e2e = STAGE == "e2e"

# 範囲の枠（先に描いて、箱の下に敷く）
if e2e:
    c.sticky(20, 250, 920, 170, color="blue", dash="dashed", weight="thin")
    c.text(920, 445, "E2E テストの範囲（Podman で動かした画面と API）", scale="label",
           align="right", fill=PALETTE["blue"]["text"])
else:
    c.sticky(250, 250, 690, 170, color="blue", dash="dashed", weight="thin")
    c.text(920, 445, "結合テストの範囲", scale="label", align="right",
           fill=PALETTE["blue"]["text"])

screen = box(130, Y, 170, 100, "画面\nnginx", "teal" if e2e else "gray")
endpoint = box(360, Y, 190, 100, "エンドポイント\nコントローラー", "teal")
logic = box(590, Y, 170, 100, "ロジック\nsettle.ts", "purple", draw=c.hexagon)
db = c.node(820, Y, "SQLite\nボリューム" if e2e else "SQLite\n一時ファイル",
            shape="cylinder", color="green", w=170, h=110, label_scale="label")

if e2e:
    tester = c.node(130, 110, "Playwright", emoji_cp="1f916", w=110, h=90,  # 🤖
                    label_scale="label")
    c.link(tester, screen, label="ブラウザで操作")
    c.link(screen, endpoint)
else:
    tester = c.node(360, 110, "テストのコード", emoji_cp="1f9ea", w=110, h=90,  # 🧪
                    label_scale="label")
    c.link(tester, endpoint, label="supertest で HTTP")
c.link(endpoint, logic)
c.link(logic, db)

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
