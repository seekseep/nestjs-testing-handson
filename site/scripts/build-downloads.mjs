#!/usr/bin/env node
/**
 * 各レクチャーのプロジェクトを ZIP 化し、site/public/downloads/<sec>-<lec>.zip に出力する。
 *
 * このハンズオンのレクチャーは「その節を終えた時点のプロジェクト」（ui/・api/・compose.yaml など）を
 * そのまま持っている（project 方式）。プロジェクトを持つかどうかは libs/lectures.mjs が判定する。
 *
 * 中身: git の追跡ファイル＋未追跡だが .gitignore されていないファイル（libs/git.mjs の lsProjectFiles）。
 *   node_modules/ .next/ out/ dist/ .env など .gitignore 済みのものは自動で除外される。
 *   そのうえで教材ファイル（LECTURE.md, images/, demos/）を明示的に除外する。
 * ZIP 内のルートフォルダは `<sec>-<lec>/`。どの節の ZIP を展開しても名前がぶつからない。
 *
 * ダウンロード URL の規約 (<sec>-<lec>.zip) は libs/naming.mjs に集約し、
 * sync-lectures.mjs のリンク生成と共有している。
 */

import { createWriteStream } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

import { ZipArchive } from 'archiver';

import { lsProjectFiles } from './libs/git.mjs';
import { listProjectLectures } from './libs/lectures.mjs';
import { isLectureAsset, parseLectureRel, zipBasenameFor, zipRootFor } from './libs/naming.mjs';
import { DOWNLOADS_DIR, ROOT } from './libs/paths.mjs';

/** files（<absDir> 相対）を outPath に ZIP 化する。ZIP 内は rootDir/ 配下に置く。 */
async function zipFiles(absDir, files, outPath, rootDir) {
  const output = createWriteStream(outPath);
  const archive = new ZipArchive({ zlib: { level: 9 } });
  const done = new Promise((resolve, reject) => {
    output.on('close', () => resolve(files.length));
    archive.on('warning', reject);
    archive.on('error', reject);
  });
  archive.pipe(output);
  for (const rel of files) {
    archive.file(path.join(absDir, ...rel.split('/')), { name: path.posix.join(rootDir, rel) });
  }
  archive.finalize();
  return done;
}

async function main() {
  await rm(DOWNLOADS_DIR, { recursive: true, force: true });
  await mkdir(DOWNLOADS_DIR, { recursive: true });

  const lectures = listProjectLectures();
  for (const lectureRel of lectures) {
    const { sec, lec } = parseLectureRel(lectureRel);
    let files;
    try {
      files = await lsProjectFiles(ROOT, lectureRel);
    } catch {
      console.warn('[build-downloads] not a git repository; skipping');
      return;
    }
    const included = files
      .map((fileRel) => path.posix.relative(lectureRel, fileRel))
      .filter((rel) => !isLectureAsset(rel));
    const outPath = path.join(DOWNLOADS_DIR, zipBasenameFor(sec, lec));
    const count = await zipFiles(path.join(ROOT, ...lectureRel.split('/')), included, outPath, zipRootFor(sec, lec));
    console.log(`[build-downloads] ${lectureRel} -> site/public/downloads/${zipBasenameFor(sec, lec)} (${count} files)`);
  }
  if (lectures.length === 0) console.warn('[build-downloads] no project lectures found');
  console.log('[build-downloads] done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
