"""07-04「サービスを単体テストする」の図。

テストのコードは SettlementService を自分で作り、本物の PaymentsRepository の代わりに偽物を渡す。
DB（DatabaseSync）までは届かない。
スキーマ: CONTAINER（単体テストの範囲）+ LINK（注入）+ BLOCKAGE（本物は使わない）。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

c = Canvas(960, 440)


def box(cx, cy, label, color, draw=None, w=220, h=96, dash="solid"):
    """2 行のラベルを図形の上下の中央に置く。"""
    n = (draw or c.sticky)(cx - w / 2, cy - h / 2, w, h, color=color, dash=dash)
    c.text(cx, cy - 4, label, scale="label", fill=PALETTE[color]["text"])
    return n


# 単体テストの範囲
c.sticky(20, 20, 600, 400, color="blue", dash="dashed", weight="thin")
c.text(44, 56, "単体テストの範囲（settlement.service.spec.ts）", scale="label", align="left",
       fill=PALETTE["blue"]["text"])

test = c.node(130, 160, "テストのコード", emoji_cp="1f9ea", w=110, h=90,  # 🧪
              label_scale="label")
service = box(450, 160, "Settlement\nService", "purple", draw=c.hexagon)
fake = box(450, 330, "偽物のリポジトリ\nfindAll() だけ", "orange", dash="dashed", w=250)

# 本物（テストでは使わない）
real = box(800, 160, "Payments\nRepository", "gray")
db = c.node(800, 330, "DatabaseSync", shape="cylinder", color="gray", w=200, h=100,
            label_scale="label")

c.link(test, service, label="作って呼ぶ")
c.link(fake, service, label="渡す")
c.link(real, db, primary=False)
c.text(800, 70, "本物（テストでは使わない）", scale="label", fill=PALETTE["gray"]["text"])

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
