"""02-02「NestJS がリクエストを届けるしくみ」の図。

GET / が届くと、AppModule の AppController の @Get() getHello() が呼ばれ、
NestJS が注入した AppService の getHello() が返した文字列がレスポンスの本文になる。
スキーマ: CONTAINER（AppModule）+ SOURCE-PATH-GOAL + CYCLE（往復）。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402

c = Canvas(900, 340)

browser = c.node(90, 190, "ブラウザ", emoji_cp="1f310")  # 🌐

module = c.sticky(230, 50, 650, 270, color="gray", dash="dashed", weight="thin")
c.text(254, 86, "AppModule", scale="heading", align="left")

controller = c.node(400, 190, "AppController\n@Get() getHello()", shape="square",
                    color="teal", w=200, h=96, label_scale="label")
service = c.node(765, 190, "AppService\ngetHello()", shape="hexagon",
                 color="purple", w=170, h=96, label_scale="label")

c.link(browser, controller, label="GET /", offset=26)
c.link(controller, browser, label="本文", offset=26, primary=False)
c.link(controller, service, label="呼ぶ", offset=26)
c.link(service, controller, label="Hello World!", offset=26, primary=False)

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
