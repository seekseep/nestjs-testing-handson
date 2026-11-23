"""08 章「コラム」どのテストを、どれだけ書くか のサムネイル。アイスクリームコーンからテストピラミッドへ。

左: アイスクリームコーン（上ほど多い。いちばん上に手動のテスト）。右: テストピラミッド（下ほど多い）。
"""

import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents
                            if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

c = Canvas(960, 400)


def band(cx, y1, y2, half, color, label=None):
    """台形の帯。half(y) はその高さでの半分の幅。"""
    pts = [(cx - half(y1), y1), (cx + half(y1), y1), (cx + half(y2), y2), (cx - half(y2), y2)]
    c._polygon(pts, color)
    if label:
        c.text(cx, (y1 + y2) / 2 + 8, label, scale="heading", fill=PALETTE[color]["text"])


# 左: アイスクリームコーン。上の丸いところが手動のテスト
CX, TOP, TIP, HALF = 230, 150, 385, 135
cone = lambda y: HALF * (TIP - y) / (TIP - TOP)  # noqa: E731
c.ellipse(CX, 92, 145, 80, color="gray")
c.text(CX, 92 + 8, "手動", scale="heading", fill=PALETTE["gray"]["text"])
band(CX, 150, 200, cone, "blue", "E2E")
band(CX, 200, 248, cone, "orange", "結合")
band(CX, 248, 296, cone, "pink", "単体")
c._polygon([(CX - cone(296), 296), (CX + cone(296), 296), (CX, TIP)], "yellow")

# 右: テストピラミッド
PX, APEX, BASE, PHALF = 720, 60, 340, 190
pyr = lambda y: PHALF * (y - APEX) / (BASE - APEX)  # noqa: E731
c._polygon([(PX, APEX), (PX + pyr(180), 180), (PX - pyr(180), 180)], "blue")
c.text(PX, 152, "E2E", scale="heading", fill=PALETTE["blue"]["text"])
band(PX, 180, 260, pyr, "orange", "結合")
band(PX, 260, BASE, pyr, "pink", "単体")

c.link((420, 235), (540, 235))

c.save("00-thumbnail.svg")
