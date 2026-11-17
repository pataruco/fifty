import { expect, test } from '@playwright/test';
import { LANGS, openHome, VARIANTS } from './helpers.ts';

for (const lang of LANGS) {
  for (const variant of VARIANTS) {
    test.describe(`${lang} ${variant}`, () => {
      test.beforeEach(async ({ page }) => {
        await openHome(page, lang, variant);
      });

      test('every control is at least 44×44 CSS px, except links inside sentences', async ({
        page,
      }) => {
        const checked = await page.$$eval('a[href], button', (controls) =>
          controls
            .filter((el) => {
              // A link inside a sentence has loose words beside it.
              const words = [...(el.parentElement?.childNodes ?? [])].some(
                (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
              );
              return el.tagName === 'BUTTON' || !words;
            })
            .map((el) => {
              const r = el.getBoundingClientRect();
              return { text: el.textContent?.trim(), w: r.width, h: r.height };
            }),
        );

        expect(checked.length).toBeGreaterThanOrEqual(4);
        expect(checked.filter((r) => r.w < 44 || r.h < 44)).toEqual([]);
      });

      test('nothing scrolls sideways at 320 px', async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 640 });
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );

        expect(overflow).toBeLessThanOrEqual(0);
      });

      test('focus is visible on every control', async ({
        page,
        browserName,
      }) => {
        const count = await page.locator('a[href], button').count();
        // Safari moves between links with Option-Tab, not Tab.
        const key = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
        const unseen: string[] = [];
        let focused = 0;
        for (let i = 0; i < count; i++) {
          await page.keyboard.press(key);
          const focus = await page.evaluate(() => {
            const el = document.activeElement as HTMLElement | null;
            if (!el || el === document.body) return null;
            const s = getComputedStyle(el);
            return {
              text: el.textContent?.trim() ?? '',
              visible: el.matches(':focus-visible'),
              outline:
                s.outlineStyle !== 'none' &&
                Number.parseFloat(s.outlineWidth) >= 2,
              colour: s.outlineColor,
            };
          });
          if (!focus) continue;
          focused++;
          if (
            !focus.visible ||
            !focus.outline ||
            /rgb\(255, 255, 255\)/.test(focus.colour)
          ) {
            unseen.push(`${focus.text} (${focus.colour})`);
          }
        }

        expect(focused).toBe(count);
        expect(unseen).toEqual([]);
      });

      test('the language link is visible at 320, 390 and 1280 px', async ({
        page,
      }) => {
        const link = page.locator('.lang-switch');
        for (const width of [320, 390, 1280]) {
          await page.setViewportSize({ width, height: 800 });
          await expect(link, `${width}px`).toBeVisible();
          const box = await link.boundingBox();
          expect(box, `${width}px`).not.toBeNull();
          expect(
            (box?.x ?? 0) + (box?.width ?? 0),
            `${width}px`,
          ).toBeLessThanOrEqual(width);
        }
      });

      test('with reduced motion, nothing transitions', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        const moving = await page.$$eval('*', (els) =>
          els
            .filter((el) => {
              const s = getComputedStyle(el);
              const durations = `${s.transitionDuration},${s.animationDuration}`;
              return durations.split(',').some((d) => Number.parseFloat(d) > 0);
            })
            .map((el) => el.className || el.tagName),
        );

        expect(moving).toEqual([]);

        await page.emulateMedia({ reducedMotion: 'no-preference' });
        const button = await page
          .locator('.btn')
          .first()
          .evaluate((el) => getComputedStyle(el).transitionDuration);
        expect(button).toBe('0.3s');
      });
    });
  }
}

test('the inline style applies and the console shows no CSP message', async ({
  page,
}) => {
  const messages: string[] = [];
  page.on('console', (m) => messages.push(m.text()));
  page.on('pageerror', (e) => messages.push(e.message));

  for (const path of ['/', '/es/', '/nowhere/']) {
    await page.goto(path);
    const h1 = await page
      .locator('h1')
      .evaluate((el) => getComputedStyle(el).fontSize);

    expect(h1, path).toBe('40px');
  }
  expect(
    messages.filter((m) => /content security policy|csp|refused/i.test(m)),
  ).toEqual([]);
});
