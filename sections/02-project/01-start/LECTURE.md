---
docs: true
title: 起動する
---

# 起動する

![02 章 起動する](./images/00-thumbnail.svg)

テストする題材の「割り勘のアプリ」をダウンロードし、Podman で動かして使ってみます。メンバーを足し、誰かが立て替えた金額を記録すると、誰が誰にいくら払えばよいか（清算）が出ます。

| API | すること |
|---|---|
| `POST /members`・`GET /members` | メンバーを足す・一覧を返す |
| `POST /payments`・`GET /payments` | 立て替え（払った人・金額・メモ・対象の人）を記録する・一覧を返す |
| `GET /settlement` | 清算の結果（誰が誰にいくら払うか）を返す |

## ダウンロードして動かす

:::download
[割り勘のアプリをダウンロード](./project.zip)
:::

ZIP を展開してできる `02-project-01-start/` を、`warikan/` のような名前に変えて好きな場所に置きます。このフォルダに、節ごとにテストを足していきます。

フォルダを VS Code で開き、ターミナルで `api/` に入って起動します。

```bash
cd api
podman compose up -d --build --wait
```

```text
 Container api-web-1 Healthy
 Container api-api-1 Healthy
```

`api/` は、`nest new` で作った NestJS のプロジェクトに、割り勘のコード（`src/` の `members/`・`payments/`・`settlement/`・`database.ts`）と、`compose.yaml`・`Dockerfile`・`public/` を足したものです。`compose.yaml` には、2 つのコンテナが書いてあります。

| コンテナ | 中身 | 開くところ |
|---|---|---|
| `web` | 画面（`public/index.html`）を配るだけの nginx | <http://localhost:3000> |
| `api` | NestJS の API。データは SQLite のファイルに置き、ファイルはボリューム（`db`）に入れる | <http://localhost:3001> |

## 動作確認する

ブラウザで <http://localhost:3000> を開きます。

1. 「名前」に `A` を入れて **メンバーを足す** を押します。`B`・`C` も同じように足します
2. 「払った人」に `A`、「金額」に `10000`、「メモ」に `飲み会` を入れ、**立て替えを記録する** を押します（対象の人は、はじめから全員に印が付いています）

「清算」に次のように出れば大丈夫です。10,000 円を 3 人で分けると 1 円余るので、A の負担が 1 円多くなります。

```text
B → A 3,333 円
C → A 3,333 円
```

画面は、`api` のコンテナの API を呼んで表示しています。API を直接呼んでも、同じ結果が JSON で返ります。

```bash
curl http://localhost:3001/settlement
```

```text
[{"from":2,"to":1,"amount":3333},{"from":3,"to":1,"amount":3333}]
```

止めるときは `podman compose down` です。データはボリュームに残るので、次に起動したときも同じメンバーと立て替えが出ます。

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [Docker: Compose file reference](https://docs.docker.com/reference/compose-file/services/) … `build`・`image`・`ports`・`volumes`
- [Docker: docker compose up](https://docs.docker.com/reference/cli/docker/compose/up/) … `--build`・`--wait`

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::

:::faq

### `podman compose up` が `Cannot connect to Podman` で失敗する

Podman の仮想マシンが止まっています。`podman machine start` で起動してから、もう一度実行してください（Linux では要りません）。

### `address already in use` で起動できない

3000 番か 3001 番を、ほかのプログラムが使っています。前に起動したコンテナが残っていないか、`podman ps` で確かめてください。

:::
