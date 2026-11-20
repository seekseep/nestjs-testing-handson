#!/usr/bin/env bash
# 前の節のプロジェクトをコピーして、次の節のディレクトリを作る。
#
#   tools/copy-lecture.sh sections/02-hello-world/01-nextjs sections/02-hello-world/02-nestjs
#
# コピーするのは git の追跡ファイルと、未追跡だが .gitignore されていないファイルだけ
# （node_modules/ .next/ out/ dist/ .env は入らない）。教材ファイル（LECTURE.md・README.md・images/）は
# 節ごとに書くのでコピーしない。
set -euo pipefail
from="${1:?from}"
to="${2:?to}"
cd "$(git rev-parse --show-toplevel)"
mkdir -p "$to"
git ls-files -z --cached --others --exclude-standard -- "$from" \
  | while IFS= read -r -d '' f; do
      rel="${f#"$from"/}"
      case "$rel" in
        LECTURE.md|README.md|images/*) continue ;;
      esac
      [ -e "$f" ] || continue
      mkdir -p "$to/$(dirname "$rel")"
      cp -p "$f" "$to/$rel"
    done
echo "copied $from -> $to"
