// Writes The Book with plain Node.
// Run: node src/book/export.ts --out dist/book [--at 2028-05-29T12:00:00Z]
//
// Like the Worker's entry point, this is where the clock is read: --at
// fixes the moment, and without it the Book is written for now.

import { parseArgs } from 'node:util';
import { writeBook } from './write-book.ts';

const { values } = parseArgs({
  options: {
    out: { type: 'string', default: 'dist/book' },
    at: { type: 'string' },
  },
});

const at = values.at === undefined ? Date.now() : Date.parse(values.at);
if (Number.isNaN(at)) {
  process.stderr.write(`--at is not a date: ${values.at}\n`);
  process.exit(1);
}

await writeBook({ outDir: values.out, at });
