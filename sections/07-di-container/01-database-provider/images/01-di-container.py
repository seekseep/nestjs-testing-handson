"""07-01「DI コンテナ」の図。

① モジュールにプロバイダーを登録する → ② DI コンテナ（NestJS）がインスタンスを作る →
③ コンストラクターで受け取りたいクラスに注入する。テストでは、コンテナを通さずに偽物を渡す。
スキーマ: SOURCE-PATH-GOAL（登録 → 作る → 注入）+ 下の段で差し替え。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

c = Canvas(960, 500)


def box(cx, cy, w, h, label, color, draw=None, dash="solid"):
    """図形を描き、ラベル（3 行まで）を図形の上下の中央に置く。"""
    n = (draw or c.sticky)(cx - w / 2, cy - h / 2, w, h, color=color, dash=dash)
    lines = label.count("\n")
    c.text(cx, cy + 8 - lines * 14, label, scale="label", fill=PALETTE[color]["text"])
    return n


# 上の段: アプリを動かすとき
c.text(30, 44, "アプリを動かすとき", scale="heading", align="left")
module = box(140, 160, 210, 110, "AppModule\nproviders", "gray")
container = box(470, 160, 200, 110, "DI コンテナ\n（NestJS）", "blue", draw=c.hexagon)
service = box(810, 160, 250, 90, "SettlementService", "purple")
c.text(810, 235, "本物のリポジトリを受け取る", scale="body", fill=PALETTE["purple"]["text"])
c.link(module, container, label="① 登録")
c.link(container, service, label="③ 注入")
c.text(470, 245, "② インスタンスを作る", scale="body", fill=PALETTE["blue"]["text"])

# 下の段: テストのとき
c.text(30, 320, "単体テストのとき", scale="heading", align="left")
fake = box(430, 400, 240, 90, "偽物のリポジトリ", "orange", dash="dashed")
service2 = box(810, 400, 250, 90, "SettlementService", "purple")
c.text(810, 475, "偽物のリポジトリを受け取る", scale="body", fill=PALETTE["purple"]["text"])
c.link(fake, service2, label="new で渡す")

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
