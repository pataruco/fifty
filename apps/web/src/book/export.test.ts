import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { css } from '@fifty/shared';
import { expect, test } from 'vitest';

const exportScript = fileURLToPath(new URL('./export.ts', import.meta.url));

test('plain Node writes the Book with the same stylesheet', async () => {
  const out = await mkdtemp(join(tmpdir(), 'fifty-book-'));

  const run = spawnSync(process.execPath, [exportScript, '--out', out], {
    encoding: 'utf8',
  });

  expect(run.stderr).toBe('');
  expect(run.status).toBe(0);
  const page = await readFile(join(out, 'index.html'), 'utf8');
  expect(page).toContain(`<style>${css}</style>`);
});
