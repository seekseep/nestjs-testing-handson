---
docs: true
title: 準備
---

# 準備

![01 章 準備](./images/00-thumbnail.svg)

このハンズオンで使う **Node.js 26** と **VS Code** を入れます。どちらもすでに入っていれば、「[バージョンを確かめる](#バージョンを確かめる)」だけで次の節に進めます。

## お使いの OS を選ぶ

手順が OS で分かれるところでは、選んだ OS の手順だけを表示します。あとから、ページの上のナビゲーションバーでも変えられます。

::platform-choice

:::::platform
::::macos
ターミナル（「アプリケーション」→「ユーティリティ」→「ターミナル」）で進めます。05 章で使う Playwright は **macOS 14（Sonoma）以降** が必要です。
::::
::::windows
**Windows 11** と **PowerShell 7** で進めます（05 章で使う Playwright が Windows 11 以降を必要とします）。メモリは 8 GB 以上、ディスクの空きは 5 GB 以上が要ります。WSL は使いません。

**PowerShell 7 を入れる**

最初から入っている「Windows PowerShell」（5.1）では、`&&` でコマンドをつなげないなど、このハンズオンのコマンドが動きません。スタートメニューから「Windows PowerShell」を開き、PowerShell 7 を入れます。

```powershell
winget install --id Microsoft.PowerShell --source winget
```

入れたら、スタートメニューから **PowerShell 7**（`pwsh`）を開きます。以降のコマンドは、すべて PowerShell 7 で実行します。

```powershell
$PSVersionTable.PSVersion
```

`7.` から始まる番号が出れば大丈夫です。
::::
::::linux
ふだんのターミナルで進めます。05 章で使う Playwright は **Ubuntu 22.04・24.04・26.04、Debian 12・13** で動きます。
::::
:::::

## Node.js を入れる

[Node.js のダウンロードのページ](https://nodejs.org/ja/download) を開き、バージョンに **v26（LTS）** を選んで入れます。

:::::platform
::::macos
macOS 用のインストーラー（`.pkg`）をダウンロードして開き、画面の案内に従って進めます。
::::
::::windows
Windows 用のインストーラー（`.msi`）をダウンロードして開き、画面の案内に従って進めます。
::::
::::linux
OS に **Linux** を選び、表示されたコマンドをターミナルで実行します。Ubuntu の `apt install nodejs` で入る Node.js は古いので使いません。
::::
:::::

入れたら、ターミナル（Windows では PowerShell 7）を開き直します。

## VS Code を入れる

エディタには [Visual Studio Code](https://code.visualstudio.com/)（VS Code）を使います。[ダウンロードのページ](https://code.visualstudio.com/download) から、お使いの OS のものを入れます。

:::::platform
::::macos
`.zip` を開くとできる `Visual Studio Code.app` を「アプリケーション」フォルダに移します。

VS Code を開き、コマンドパレット（`Cmd + Shift + P`）で **Shell Command: Install 'code' command in PATH** を実行すると、ターミナルから `code .` でフォルダを開けるようになります。
::::
::::windows
ユーザー インストーラー（User Installer）をダウンロードして開き、画面の案内に従って進めます。「PATH への追加」にチェックが入っていれば、PowerShell から `code .` でフォルダを開けます。
::::
::::linux
Ubuntu・Debian なら `.deb` をダウンロードして入れます。

```bash
sudo apt install ./<ダウンロードしたファイル>.deb
```
::::
:::::

プロジェクトのフォルダで `code .` を実行すると、VS Code で開きます。`` Ctrl + ` ``（バッククォート）でエディタの中にターミナルが開き、右上の **＋** でもう 1 つ開けます。

## バージョンを確かめる

```bash
node -v
npm -v
```

```text
v26.13.1
11.12.1
```

`v26.` から始まっていれば大丈夫です（細かい番号は入れた日によって違います）。

```bash
code --version
```

VS Code のバージョンの番号が出れば、ターミナルから `code` を使えます。

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [Node.js: ダウンロード](https://nodejs.org/ja/download) … インストーラーでの入れ方
- [Microsoft Learn: Windows への PowerShell のインストール](https://learn.microsoft.com/ja-jp/powershell/scripting/install/installing-powershell-on-windows) … winget で PowerShell 7 を入れる方法
- [Visual Studio Code: Setup Overview](https://code.visualstudio.com/docs/setup/setup-overview) … OS ごとの入れ方
- [Playwright: Installation](https://playwright.dev/docs/intro) … Playwright が動く OS（System requirements）

:::faq

### Node.js を入れたのに `node -v` で違うバージョンが出る

前に別の方法（Homebrew・nvm など）で入れた Node.js が先に使われています。`which node`（Windows の PowerShell では `Get-Command node`）で場所を確かめ、古いほうをアンインストールするか、`PATH` の順番を見直します。

:::
