# API を動かすコンテナのイメージ
FROM docker.io/library/node:26-slim
WORKDIR /app

# 先にライブラリを入れる（package.json が変わらなければ、次からはこの段を使い回す）
COPY package.json package-lock.json ./
RUN npm ci

# ソースをコピーしてビルドする
COPY . .
RUN npm run build

CMD ["node", "dist/main.js"]
