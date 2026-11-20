---
docs: true
title: モックとカバレッジ
---

# モックとカバレッジ

![03 章 モックとカバレッジ](./images/00-thumbnail.svg)

前の節では、ほかの部品に頼らない関数とサービスを確かめました。この節では、ほかの部品に頼っている `AuthGuard` を確かめます。そのために、頼っている相手を **偽物（モック）** に差し替えます。最後に、テストがコードのどこを通ったかを **カバレッジ** で見ます。

## 偽物（モック）で切り離す

`AuthGuard` は、トークンの検証を `TokenVerifier` に任せていて、`TokenVerifier` は Cognito を見に行きます。そのまま動かすと、Cognito が無いと（このハンズオンの環境では）どのトークンも `401` になり、「正しいトークンなら通す」を確かめられません。

単体テストでは、確かめたいクラスの **相手を偽物に差し替えて** 切り離します。偽物は「こう呼ばれたら、こう返す」をテストの中で決められ、どう呼ばれたかも記録します。

::diff{file="api/src/auth/auth.guard.spec.ts"}

- `vi.fn<TokenVerifier['verify']>()` … 偽物の関数を作ります。`vi` は Vitest の道具箱です（`describe` と同じく、import しなくても使えます）。型を付けると、返す値の形を TypeScript が確かめてくれます
- `new AuthGuard({ verify } as unknown as TokenVerifier)` … NestJS の DI を使わず、`new` で直接作ります。`verify` だけを持つ偽物を `TokenVerifier` として渡します。コンストラクターに偽物を渡すだけで差し替えられるのは、`AuthGuard` が DI で相手を受け取る作りになっているおかげです
- `verify.mockResolvedValue(alice)` … 呼ばれたら `alice` を返す（`Promise` で）ように決めます。`mockRejectedValue()` は、例外を投げる（`Promise` が失敗する）ように決めます
- `expect(verify).toHaveBeenCalledWith('Bearer good')` … 偽物が、この引数で呼ばれたかを確かめます。Guard が `Authorization` ヘッダーをそのまま渡していることが分かります
- `beforeEach(() => verify.mockReset())` … テストごとに、偽物の記録と決めごとを消します。前のテストの影響を受けないようにするためです
- `contextFor()` … Guard が受け取る `ExecutionContext` のまねです。`AuthGuard` が使う `switchToHttp().getRequest()` だけを用意しています

`canActivate()` は `async` なので、`await expect(...).resolves.toBe(true)` / `await expect(...).rejects.toThrow(...)` で確かめます。`await` を忘れると、確かめる前にテストが終わってしまいます。

```bash
npm test
```

```text
 Test Files  4 passed (4)
      Tests  16 passed (16)
```

:::notice
偽物で確かめられるのは、「`TokenVerifier` がこう答えたら、`AuthGuard` はこうする」までです。`TokenVerifier` が本物の Cognito のトークンを正しく検証できるかは、このテストでは分かりません。このハンズオンでは、本物の Cognito での確かめは扱いません。
:::

## カバレッジを見る

テストがコードのどこを通ったかの割合を、**カバレッジ** と呼びます。`nest new` のプロジェクトには、カバレッジを出すコマンドと道具（`@vitest/coverage-v8`）がはじめから入っています。

```bash
npm run test:cov
```

```text
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   70.17 |       60 |   78.57 |   70.58 |
 auth              |   46.66 |    38.88 |   57.14 |   48.27 |
  auth.guard.ts    |     100 |       50 |     100 |     100 | 13
  bearer-token.ts  |     100 |      100 |     100 |     100 |
  ...n-verifier.ts |   11.11 |        0 |       0 |   11.76 | 8-11,24-46
  user.ts          |     100 |      100 |     100 |     100 |
 notes             |   96.29 |    91.66 |     100 |     100 |
  notes.service.ts |   96.29 |    91.66 |     100 |     100 | 52
-------------------|---------|----------|---------|---------|-------------------
```

| 列 | 意味 |
|---|---|
| `% Stmts` | 文（ステートメント）のうち、通った割合 |
| `% Branch` | `if` などの分かれ道のうち、通った割合 |
| `% Funcs` | 関数のうち、呼ばれた割合 |
| `% Lines` | 行のうち、通った割合 |
| `Uncovered Line #s` | 通らなかった行（分かれ道の片方だけ通らなかった行も出る） |

`api/coverage/index.html` をブラウザで開くと、ファイルごとに、通らなかった行に色が付いて見られます（`coverage/` は `.gitignore` 済みです）。

表から、次のことが読み取れます。

- `notes.service.ts` の 52 行目 … `update()` で本文を書き換える分かれ道を、まだ通っていません。「本文を書き換えると、本文が変わる」テストが足りない、という目安になります
- `token-verifier.ts` … ほとんど通っていません。Cognito と話す部分で、この章のテストでは偽物に差し替えたからです。04 章・05 章でも偽物に差し替えるので、このハンズオンでは通りません
- `auth.guard.ts` の 13 行目 … `@Injectable()` の行です。TypeScript がデコレーターのために足したコードの分かれ道で、テストで通すものではありません
- 表に出ていないファイル（`notes.controller.ts` など）… テストから一度も読み込まれていません。コントローラーは、HTTP のリクエストを受けてサービスを呼ぶのが仕事なので、次の章の **結合テスト** で、HTTP で呼んで確かめるほうが向いています

カバレッジは「テストが足りない場所を探す」ための目安です。100% を目指すより、まちがえると困るところ（認可の判定など）を確かめることを大事にします。

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [Vitest: Mocking](https://vitest.dev/guide/mocking) … `vi.fn()` で偽物を作る
- [Vitest: Mock Functions](https://vitest.dev/api/mock) … `mockResolvedValue()`・`mockRejectedValue()`・`mockReset()`
- [Vitest: expect](https://vitest.dev/api/expect) … `toHaveBeenCalledWith()`、`resolves`・`rejects`
- [Vitest: Coverage](https://vitest.dev/guide/coverage) … `--coverage` と v8 のカバレッジ
- [Vitest: coverage の設定](https://vitest.dev/config/coverage) … 読み込まれたファイルだけが表に出る（`coverage.include` の既定）
- [Vitest: Migration Guide](https://vitest.dev/guide/migration) … Jest との違い

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::

:::faq

### Jest で書くとどう違う？

書き方はほとんど同じで、`vi` が `jest` になります。

| Vitest | Jest |
|---|---|
| `vi.fn()` | `jest.fn()` |
| `vi.spyOn()` | `jest.spyOn()` |
| `vi.mock('./x.js')` | `jest.mock('./x.js')` |
| `vitest.config.ts` | `jest.config.ts` |

NestJS 11 までの `nest new` は Jest を入れていました。このハンズオンの API は ESM（`package.json` の `"type": "module"`）なので、Jest で動かすには ESM と TypeScript の変換の設定が別に要ります。Vitest はそのまま動きます。

### `as unknown as TokenVerifier` は何？

`{ verify }` は `TokenVerifier` の一部しか持っていないので、そのままでは TypeScript が「`TokenVerifier` ではない」とエラーにします。`as unknown as TokenVerifier` は、「テストのために、これを `TokenVerifier` として扱う」と TypeScript に伝える書き方です。本物のコードでは使わず、テストの偽物を渡すときだけにします。

### カバレッジに入れるファイルを決めたい

`vitest.config.ts` の `test.coverage.include`（たとえば `['src/**/*.ts']`）で決められます。そうすると、テストから読み込まれていないファイルも 0% として表に出ます。

:::
