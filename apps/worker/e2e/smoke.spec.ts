import { expect, test } from '@playwright/test';
import { runSmoke } from '../scripts/smoke.ts';
import { BASE_URL, SAMPLE } from './playwright.config.ts';

// The smoke test only needs one browser's request context.
test.skip(({ browserName }) => browserName !== 'chromium');

test('the smoke test passes against wrangler dev', async ({ playwright }) => {
  // Playwright's request context accepts the dev server's own certificate.
  // A fresh context per request, because a context keeps cookies and
  // fetch does not: the smoke test sends the guest cookie itself.
  const viaPlaywright: typeof fetch = async (input, init) => {
    const request = await playwright.request.newContext({
      ignoreHTTPSErrors: true,
    });
    try {
      const url = input instanceof Request ? input.url : String(input);
      const response = await request.fetch(url, {
        method: init?.method ?? 'GET',
        headers: Object.fromEntries(new Headers(init?.headers)),
        maxRedirects: 0,
      });
      const headers = new Headers();
      for (const { name, value } of response.headersArray()) {
        headers.append(name, value);
      }
      const status = response.status();
      const body =
        status === 204 || status === 304
          ? null
          : new Uint8Array(await response.body());
      return new Response(body, { status, headers });
    } finally {
      await request.dispose();
    }
  };

  const results = await runSmoke({
    baseUrl: BASE_URL,
    inviteWords: SAMPLE.INVITE_WORDS,
    fetch: viaPlaywright,
    now: Date.now(),
  });

  expect(results.filter((r) => !r.ok)).toEqual([]);
  expect(results.length).toBeGreaterThanOrEqual(8);
});
