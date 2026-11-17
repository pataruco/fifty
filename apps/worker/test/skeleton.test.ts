import { exports } from 'cloudflare:workers';
import { css, styleHash } from '@fifty/shared';
import { expect, test } from 'vitest';

test('serves the shared stylesheet inline', async () => {
  const response = await exports.default.fetch('https://fifty.test/');

  expect(await response.text()).toContain(`<style>${css}</style>`);
});

test('the CSP style hash is the SHA-256 of the inline style', async () => {
  const response = await exports.default.fetch('https://fifty.test/');
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(css),
  );
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));

  expect(response.headers.get('Content-Security-Policy')).toContain(
    `'${styleHash}'`,
  );
  expect(styleHash).toBe(`sha256-${base64}`);
});
