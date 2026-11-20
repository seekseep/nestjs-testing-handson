/** git 管理下のファイルを扱うためのヘルパー。 */

import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * `git ls-files -z` で pathspec に一致する追跡ファイルを列挙し、
 * POSIX 区切りの相対パス配列で返す。
 * 追跡下のファイルだけを対象にすることで、node_modules/ や .gitignore
 * 済みのファイル (dist/, .dev.vars, *.pem など) は自動的に除外される。
 */
export async function lsFiles(cwd, pathspec, maxBuffer = 20 * 1024 * 1024) {
  const { stdout } = await execFileAsync(
    'git',
    ['ls-files', '-z', '--', pathspec],
    { cwd, maxBuffer },
  );
  return stdout
    .split('\0')
    .filter(Boolean)
    .map((p) => p.split(path.sep).join('/'));
}

/**
 * レクチャー配下の「プロジェクトとして配るファイル」を列挙する。
 * 追跡済みに加えて、まだコミットしていない（でも .gitignore されていない）ファイルも含める。
 * こうしておくと、節を書いている途中でも ZIP・::tree・::diff が最新の作業ツリーを反映する。
 * node_modules/ や .env などの .gitignore 済みのものは入らない。作業ツリーで消したファイルも除く。
 */
export async function lsProjectFiles(cwd, pathspec, maxBuffer = 50 * 1024 * 1024) {
  const { stdout } = await execFileAsync(
    'git',
    ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--deduplicate', '--', pathspec],
    { cwd, maxBuffer },
  );
  const { existsSync } = await import('node:fs');
  const files = stdout
    .split('\0')
    .filter(Boolean)
    .map((p) => p.split(path.sep).join('/'))
    .filter((p) => existsSync(path.join(cwd, ...p.split('/'))));
  return [...new Set(files)].sort();
}
