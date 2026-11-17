// public/ is served by the Worker's static assets, before the Worker runs.

import { readdir, readFile } from 'node:fs/promises';
import { describe, expect, test } from 'vitest';

const publicDir = new URL('../public/', import.meta.url);

describe('public/', () => {
  test('public/ holds no HTML', async () => {
    const files = await readdir(publicDir, { recursive: true });

    expect(files.filter((f) => /\.html?$/i.test(f))).toEqual([]);
  });

  test('_headers sets X-Robots-Tag, nosniff and no-referrer on every file', async () => {
    const headers = await readFile(new URL('_headers', publicDir), 'utf8');
    const [path, ...lines] = headers.trim().split('\n');

    expect(path).toBe('/*');
    expect(lines.map((l) => l.trim())).toEqual([
      'X-Robots-Tag: noindex, nofollow',
      'X-Content-Type-Options: nosniff',
      'Referrer-Policy: no-referrer',
    ]);
  });

  test('robots.txt lets crawlers in, so they can see noindex', async () => {
    const robots = await readFile(new URL('robots.txt', publicDir), 'utf8');

    expect(robots).toMatch(/^User-agent: \*\nAllow: \/\n?$/);
  });
});
