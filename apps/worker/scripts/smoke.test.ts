// Runs in Node, against a fake site, so each check is seen to fail.

import { emailAddress, type Lang, renderPage, seasonAt } from '@fifty/shared';
import { describe, expect, test } from 'vitest';
import { runSmoke, type SmokeResult } from './smoke.ts';

const BASE = 'https://fifty.test';
const WORDS = 'otter lantern meadow harbour';
const NOW = Date.UTC(2027, 0, 15, 12);
const COOKIE = '__Host-fifty-guest';

interface Defects {
  /** Cache-Control on guest pages. */
  readonly guestCache?: string;
  /** Show join buttons to the public. */
  readonly publicJoin?: boolean;
  /** Change the public HTML, as Email Address Obfuscation would. */
  readonly drift?: boolean;
  /** Let a cache answer the guest page. */
  readonly cacheHit?: boolean;
}

/** A site that behaves like the Worker, with optional defects. */
function fakeSite(defects: Defects = {}): typeof fetch {
  return async (input, init) => {
    const request = new Request(input, init);
    const { pathname } = new URL(request.url);
    const guest = (request.headers.get('Cookie') ?? '').includes(
      `${COOKIE}=ok`,
    );

    const hello = /^(\/es)?\/hello\/([^/]*)\/$/.exec(pathname);
    if (hello) {
      if (hello[2] === WORDS.replaceAll(' ', '-')) {
        return new Response(null, {
          status: 303,
          headers: {
            Location: hello[1] ? '/es/' : '/',
            'Set-Cookie': `${COOKIE}=ok; Max-Age=100; Path=/; Secure; HttpOnly; SameSite=Lax`,
            'Cache-Control': 'no-store',
          },
        });
      }
      return new Response('gone', {
        status: 404,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    const lang: Lang = pathname === '/es/' ? 'es' : 'en';
    const asGuest = guest || defects.publicJoin === true;
    let html = renderPage({
      page: 'home',
      lang,
      season: seasonAt(NOW),
      viewer: asGuest
        ? { kind: 'guest', joinEmail: emailAddress('join@example.test') }
        : { kind: 'public' },
      links: 'absolute',
      path: lang === 'es' ? '/es/' : '/',
    }).html;
    if (defects.drift && !guest) {
      html = html.replace(
        'mailto:hola@pataruco.dev',
        '/cdn-cgi/l/email-protection',
      );
    }
    const headers = new Headers({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': guest
        ? (defects.guestCache ?? 'private, no-store')
        : 'no-cache',
    });
    if (guest && defects.cacheHit) headers.set('CF-Cache-Status', 'HIT');
    return new Response(html, { headers });
  };
}

const smoke = (defects?: Defects) =>
  runSmoke({
    baseUrl: BASE,
    inviteWords: WORDS,
    fetch: fakeSite(defects),
    now: NOW,
  });

const failed = (results: readonly SmokeResult[]) =>
  results.filter((r) => !r.ok).map((r) => r.name);

describe('runSmoke', () => {
  test('passes against a site that behaves', async () => {
    const results = await smoke();

    expect(failed(results)).toEqual([]);
    expect(results.length).toBeGreaterThanOrEqual(6);
  });

  test('runSmoke fails when a guest page is cacheable', async () => {
    expect(failed(await smoke({ guestCache: 'public, max-age=60' }))).toEqual([
      'the guest page is private, no-store and not from a cache',
    ]);
    expect(failed(await smoke({ cacheHit: true }))).toEqual([
      'the guest page is private, no-store and not from a cache',
    ]);
  });

  test('runSmoke fails when the public page has a join button', async () => {
    expect(failed(await smoke({ publicJoin: true }))).toEqual(
      expect.arrayContaining([
        '/ equals the renderer',
        '/ has no script, /cdn-cgi/ or join button',
        'a public request after the guest one gets the public page',
      ]),
    );
  });

  test('runSmoke fails when production HTML differs from the renderer', async () => {
    expect(failed(await smoke({ drift: true }))).toEqual(
      expect.arrayContaining([
        '/ equals the renderer',
        '/es/ equals the renderer',
        '/ has no script, /cdn-cgi/ or join button',
      ]),
    );
  });

  test('a network error is a failed check, not a crash', async () => {
    const results = await runSmoke({
      baseUrl: BASE,
      inviteWords: WORDS,
      fetch: async () => {
        throw new Error('offline');
      },
      now: NOW,
    });

    expect(results.every((r) => !r.ok)).toBe(true);
    expect(results[0]?.detail).toContain('offline');
  });
});
