// Scans the shared sources for the patterns the renderer must never use.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const root = fileURLToPath(new URL('.', import.meta.url));

async function sources(): Promise<{ path: string; text: string }[]> {
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith('.ts'))
    .filter((e) => !e.name.endsWith('.test.ts'))
    .map((e) => join(e.parentPath, e.name));

  return Promise.all(
    files.map(async (file) => ({
      path: relative(root, file),
      text: await readFile(file, 'utf8'),
    })),
  );
}

function offenders(
  files: { path: string; text: string }[],
  pattern: RegExp,
): string[] {
  return files.filter((f) => pattern.test(f.text)).map((f) => f.path);
}

describe('trust boundary', () => {
  test('trustBuild* is called only in generated/assets.ts', async () => {
    const files = await sources();
    const callers = files
      .filter((f) =>
        f.text
          .split('\n')
          .some(
            (line) =>
              /trustBuild(Output|Href)\b/.test(line) &&
              !/export function trustBuild/.test(line),
          ),
      )
      .map((f) => f.path);

    expect(callers).toEqual(['generated/assets.ts']);
  });

  test('no template interpolates an unquoted attribute', async () => {
    expect(offenders(await sources(), /=\$\{/)).toEqual([]);
  });

  test('nothing is interpolated inside <style> or <script>', async () => {
    const pattern = /<(style|script)\b[^>]*>[^<]*\$\{/;

    expect(offenders(await sources(), pattern)).toEqual([]);
  });

  test('nothing reads the clock, local time or Intl', async () => {
    const pattern =
      /Date\.now\(|new Date\(\s*\)|\.get(FullYear|Month|Date|Day|Hours|Minutes|Seconds|Milliseconds|TimezoneOffset)\(|\bIntl\b|toLocale\w*\(/;

    expect(offenders(await sources(), pattern)).toEqual([]);
  });
});
