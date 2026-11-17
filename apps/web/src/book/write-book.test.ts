import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS, pathFor, renderPage, seasonAt } from '@fifty/shared';
import { describe, expect, test } from 'vitest';
import { bookFileFor, writeBook } from './write-book.ts';

const AT = Date.UTC(2027, 0, 15, 12);
const exportScript = fileURLToPath(new URL('./export.ts', import.meta.url));

async function book(at = AT) {
  const outDir = await mkdtemp(join(tmpdir(), 'fifty-book-'));
  const files = await writeBook({ outDir, at });
  const read = (file: string) => readFile(join(outDir, file), 'utf8');
  return { outDir, files, read };
}

/** The href of every <a>, in order. */
const anchorHrefs = (markup: string) =>
  [...markup.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)].map((m) => m[1] ?? '');

describe('the Book', () => {
  test('writes index.html and es/index.html', async () => {
    const { files } = await book();

    expect(files).toEqual(['index.html', 'es/index.html']);
    expect(bookFileFor('home', 'en')).toBe('index.html');
    expect(bookFileFor('home', 'es')).toBe('es/index.html');
  });

  test('the Book carries no guest content', async () => {
    const { files, read } = await book();
    for (const file of files) {
      const page = await read(file);

      expect(page, file).not.toContain('data-join');
      expect(
        anchorHrefs(page).filter((h) => h.startsWith('mailto:')),
        file,
      ).toEqual(['mailto:hola@pataruco.dev']);
    }
  });

  test('every internal link is relative, ends in .html or #id, and resolves to a written file', async () => {
    const { files, read } = await book();
    for (const file of files) {
      const page = await read(file);
      for (const href of anchorHrefs(page)) {
        if (/^(mailto:|https:)/.test(href)) continue;
        if (href.startsWith('#')) {
          expect(page, href).toContain(`id="${href.slice(1)}"`);
          continue;
        }
        expect(href, file).not.toMatch(/^\//);
        expect(href, file).toMatch(/\.html(#[\w-]+)?$/);
        const target = new URL(href, `file:///book/${file}`).pathname.replace(
          /^\/book\//,
          '',
        );
        expect(files, `${file} → ${href}`).toContain(target.split('#')[0]);
      }
    }
  });

  test('the Book loads nothing from the network', async () => {
    const { files, read } = await book();
    for (const file of files) {
      const page = await read(file);

      expect(page).not.toMatch(/<script/i);
      expect(page).not.toMatch(/<link\b[^>]*rel="stylesheet"/i);
      expect(page).not.toMatch(/\ssrc="https?:/i);
      expect(page).not.toMatch(/<link\b[^>]*href="https?:/i);
    }
  });

  test("the Book's Home equals the Worker's public Home apart from the link style", async () => {
    const { read } = await book();
    for (const lang of LANGS) {
      const file = bookFileFor('home', lang);
      const fromBook = (await read(file)).replace(
        /\shref="([^"]*)"/g,
        (whole, href: string) => {
          if (href.startsWith('#') || /^[a-z]+:/i.test(href)) return whole;
          const path = new URL(href, `file:///book/${file}`).pathname
            .replace(/^\/book/, '')
            .replace(/index\.html$/, '');
          return ` href="${path}"`;
        },
      );
      const worker = renderPage({
        page: 'home',
        lang,
        season: seasonAt(AT),
        viewer: { kind: 'public' },
        links: 'absolute',
        path: pathFor('home', lang),
      }).html;

      expect(fromBook).toBe(worker);
    }
  });

  test('the Book is byte-identical under TZ=America/Caracas and TZ=Pacific/Kiritimati', async () => {
    const at = '2027-01-15T12:00:00Z';
    const outputs = [];
    for (const TZ of ['America/Caracas', 'Pacific/Kiritimati']) {
      const out = await mkdtemp(join(tmpdir(), 'fifty-book-tz-'));
      const run = spawnSync(
        process.execPath,
        [exportScript, '--out', out, '--at', at],
        { encoding: 'utf8', env: { ...process.env, TZ } },
      );

      expect(run.stderr, TZ).toBe('');
      expect(run.status, TZ).toBe(0);
      outputs.push(
        await Promise.all(
          ['index.html', 'es/index.html'].map((f) =>
            readFile(join(out, f), 'utf8'),
          ),
        ),
      );
    }

    expect(outputs[0]).toEqual(outputs[1]);
    const { read } = await book(Date.parse(at));
    expect(outputs[0]?.[0]).toBe(await read('index.html'));
  });

  test('export refuses an --at that is not a date', () => {
    const run = spawnSync(
      process.execPath,
      [exportScript, '--out', tmpdir(), '--at', 'tomorrow'],
      { encoding: 'utf8' },
    );

    expect(run.status).not.toBe(0);
    expect(run.stderr).toMatch(/--at/);
  });
});
