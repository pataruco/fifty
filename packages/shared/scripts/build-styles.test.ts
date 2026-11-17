import { readFile } from 'node:fs/promises';
import { describe, expect, test } from 'vitest';
import { faviconHref, logoSvg } from '../src/index.ts';
import {
  buildAssetsModule,
  cleanLogo,
  faviconDataUrl,
} from './build-styles.ts';

const read = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

test('generated assets are up to date with their sources', async () => {
  const committed = await read('../src/generated/assets.ts');
  const built = await buildAssetsModule({
    css: await read('../src/styles/fifty.css'),
    logoSvg: await read('../src/brand/logo.svg'),
    faviconSvg: await read('../src/brand/favicon.svg'),
  });

  expect(built).toBe(committed);
});

describe('brand assets', () => {
  test('the logo keeps only viewBox and path d, and adds aria-hidden, focusable=false and fill=currentColor', () => {
    const dirty =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" style="color:red" aria-label="Pedro" font-family="Inter">\n' +
      '  <path font-weight="700" d="M0 0h10\n v10Z" style="x" />\n</svg>';

    expect(String(cleanLogo(dirty))).toBe(
      '<svg viewBox="0 0 10 10" aria-hidden="true" focusable="false" fill="currentColor"><path d="M0 0h10 v10Z"/></svg>',
    );
    expect(String(logoSvg)).toMatch(
      /^<svg viewBox="[\d. ]+" aria-hidden="true" focusable="false" fill="currentColor">(<path d="[^"<>]+"\/>)+<\/svg>$/,
    );
  });

  test('the favicon is a data: link with no @import', () => {
    expect(faviconHref).toMatch(/^data:image\/svg\+xml,/);
    const svg = decodeURIComponent(faviconHref);

    expect(svg).not.toMatch(/@import/i);
    expect(svg.replace('xmlns="http://www.w3.org/2000/svg"', '')).not.toMatch(
      /https?:/i,
    );
    expect(() =>
      faviconDataUrl(
        "<svg><style>@import url('https://fonts.test/x');</style></svg>",
      ),
    ).toThrow(/@import/);
  });
});
