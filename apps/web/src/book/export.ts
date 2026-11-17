// Writes The Book with plain Node.
// Run: node src/book/export.ts --out dist/book
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { css } from '@fifty/shared';

const { values } = parseArgs({
  options: { out: { type: 'string', default: 'dist/book' } },
});

const page = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Fifty</title><style>${css}</style></head><body><p>Fifty</p></body></html>`;

await mkdir(values.out, { recursive: true });
await writeFile(join(values.out, 'index.html'), page);
