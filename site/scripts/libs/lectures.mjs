/**
 * レクチャーの並びと「前の節」を解決するモジュール。
 *
 * このハンズオンは 1 つのプロジェクトを節ごとに育てていく。各レクチャーのディレクトリは
 * 「その節を終えた時点のプロジェクト」なので、前の節のディレクトリと比べれば
 * その節で何が変わったか（::diff / ::tree）が分かる。
 *
 * プロジェクトを持つレクチャー（project lecture）は、PROJECT_MARKERS のどれかを持つもの。
 * 環境構築の節のように本文だけのレクチャーは並びには入るが、「前の節」の候補にはならない。
 */

import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import { ROOT } from './paths.mjs';

const PROJECT_MARKERS = ['ui', 'api', 'compose.yaml', 'package.json'];
const NUMBERED = /^\d\d-/;

function numberedDirs(abs) {
  try {
    return readdirSync(abs, { withFileTypes: true })
      .filter((d) => d.isDirectory() && NUMBERED.test(d.name))
      .map((d) => d.name)
      .sort();
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

/** `sections/<sec>/<lec>` をすべて、サイドバーと同じ順に返す。 */
export function listLectures() {
  const out = [];
  for (const sec of numberedDirs(path.join(ROOT, 'sections'))) {
    for (const lec of numberedDirs(path.join(ROOT, 'sections', sec))) {
      out.push(`sections/${sec}/${lec}`);
    }
  }
  return out;
}

/** そのレクチャーがプロジェクト（ui/ や api/）を持つか。 */
export function isProjectLecture(lectureRel) {
  return PROJECT_MARKERS.some((marker) => {
    try {
      statSync(path.join(ROOT, ...lectureRel.split('/'), marker));
      return true;
    } catch (e) {
      if (e.code === 'ENOENT') return false;
      throw e;
    }
  });
}

/** プロジェクトを持つレクチャーだけを順に返す。 */
export function listProjectLectures() {
  return listLectures().filter(isProjectLecture);
}

/**
 * 直前のプロジェクトを持つレクチャー（`sections/<sec>/<lec>`）。無ければ null。
 * 章をまたいでたどる（03 章の最初の節の「前」は 02 章の最後の節）。
 */
export function previousProjectLecture(lectureRel) {
  const all = listLectures();
  const i = all.indexOf(lectureRel);
  for (let j = (i === -1 ? all.length : i) - 1; j >= 0; j--) {
    if (isProjectLecture(all[j])) return all[j];
  }
  return null;
}
