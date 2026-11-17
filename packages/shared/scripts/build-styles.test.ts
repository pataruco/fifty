import { readFile } from 'node:fs/promises';
import { expect, test } from 'vitest';
import { buildAssetsModule } from './build-styles.ts';

const read = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

test('generated assets are up to date with their sources', async () => {
  const css = await read('../src/styles/fifty.css');
  const committed = await read('../src/generated/assets.ts');

  expect(await buildAssetsModule({ css })).toBe(committed);
});
