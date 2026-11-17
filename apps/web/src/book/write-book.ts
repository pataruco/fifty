// The Book: the same pages the Worker makes, written once as files that
// open from disk. Public viewer only, and links written relative.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import {
  BUILT_PAGES,
  type BuiltPage,
  LANGS,
  type Lang,
  pathFor,
  renderPage,
  seasonAt,
} from '@fifty/shared';

/** "/" → "index.html", "/es/" → "es/index.html". */
export function bookFileFor(page: BuiltPage, lang: Lang): string {
  return `${pathFor(page, lang).slice(1)}index.html`;
}

/** Writes every built page in every language; returns the files written. */
export async function writeBook(o: {
  readonly outDir: string;
  readonly at: number;
}): Promise<readonly string[]> {
  const written: string[] = [];
  for (const page of BUILT_PAGES) {
    for (const lang of LANGS) {
      const file = bookFileFor(page, lang);
      const { html } = renderPage({
        page,
        lang,
        season: seasonAt(o.at),
        viewer: { kind: 'public' },
        links: 'relative',
        path: pathFor(page, lang),
      });
      const target = join(o.outDir, file);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, html);
      written.push(file);
    }
  }
  return written;
}
