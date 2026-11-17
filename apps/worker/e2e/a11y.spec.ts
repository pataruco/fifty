import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { LANGS, openHome, VARIANTS } from './helpers.ts';

const TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag2aaa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
  'best-practice',
];

for (const lang of LANGS) {
  for (const variant of VARIANTS) {
    test(`${lang} ${variant} Home has no axe violations`, async ({ page }) => {
      await openHome(page, lang, variant);
      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();

      expect(results.violations).toEqual([]);
    });
  }
}

test('the error pages have no axe violations', async ({ page }) => {
  for (const path of ['/nowhere/', '/es/hello/old-words-here/']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();

    expect(results.violations, path).toEqual([]);
  }
});
