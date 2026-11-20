# メモのアプリ（NestJS）

NestJS で作ったメモの API と、それを呼ぶ画面（HTML 1 枚）です。

## 動かし方

```bash
cd api
npm install
npm start
```

ブラウザで <http://localhost:3000> を開きます。

## テスト

```bash
cd api
npm test
```

## 環境変数

`api/.env` は無くても動きます。そのときは、どのトークンも 401 になります。Cognito で本物のトークンを検証したいときだけ、`api/.env.example` をコピーして `api/.env` を作り、自分のユーザープールの ID を書きます。
