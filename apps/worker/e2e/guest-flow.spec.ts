import { expect, test } from '@playwright/test';
import { homePath, invitePath, LANGS } from './helpers.ts';

for (const lang of LANGS) {
  test(`${lang}: visiting Home first, then the invite link, shows the join buttons`, async ({
    page,
  }) => {
    await page.goto(homePath(lang));
    await expect(page.locator('[data-join]')).toHaveCount(0);

    await page.goto(invitePath(lang));
    await page.waitForURL((url) => url.pathname === homePath(lang));

    await expect(page.locator('[data-join]')).toHaveCount(5);
    const href = await page
      .locator('[data-join="part-1"]')
      .getAttribute('href');
    expect(href).toMatch(/^mailto:join@example\.test\?subject=/);
  });
}

test('a second browser stays public', async ({ browser, page }) => {
  await page.goto(invitePath('en'));
  await expect(page.locator('[data-join]')).toHaveCount(5);

  const other = await browser.newContext({ ignoreHTTPSErrors: true });
  const stranger = await other.newPage();
  await stranger.goto('/');
  await expect(stranger.locator('[data-join]')).toHaveCount(0);
  await expect(stranger.locator('.lead')).toBeVisible();
  await other.close();
});

test('old words show the old-link page and leave a stranger public', async ({
  page,
}) => {
  const response = await page.goto('/hello/old-words-here/');

  expect(response?.status()).toBe(404);
  await page.goto('/');
  await expect(page.locator('[data-join]')).toHaveCount(0);
});
