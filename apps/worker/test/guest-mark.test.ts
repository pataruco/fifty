import { env } from 'cloudflare:workers';
import { describe, expect, test } from 'vitest';
import {
  GUEST_COOKIE,
  guestCookie,
  importMarkKey,
  MARK_END,
  MAX_AGE_CAP_S,
  needsRefresh,
  readCookie,
  signMark,
  verifyMark,
} from '../src/guest-mark.ts';
import { normaliseWords, wordsMatch } from '../src/invite-words.ts';

const DAY = 86_400_000;
const NOW = Date.UTC(2027, 3, 1, 12);
const key = await importMarkKey(env.GUEST_KEY);

describe('the guest mark', () => {
  test('a fresh mark verifies and carries its time to the second', async () => {
    const mark = await signMark(NOW, key);

    expect(mark).toMatch(/^g1\.[0-9a-z]+\.[A-Za-z0-9_-]+$/);
    expect(await verifyMark(mark, key, NOW)).toEqual({ issuedAt: NOW });
  });

  test('keys under 32 bytes are refused', async () => {
    await expect(importMarkKey(btoa('short'))).rejects.toThrow();
    await expect(importMarkKey('')).rejects.toThrow();
    await expect(importMarkKey('not base64 at all!')).rejects.toThrow();
  });

  test('tampered, future-dated, too old and post-MARK_END marks are refused', async () => {
    const mark = await signMark(NOW, key);
    const [version, issued, signature] = mark.split('.');
    const other = await importMarkKey(btoa('x'.repeat(32)));

    const refused = [
      `${version}.${(Number.parseInt(issued ?? '', 36) - 1).toString(36)}.${signature}`,
      `${version}.${issued}.${signature?.slice(1)}A`,
      `g2.${issued}.${signature}`,
      `${mark}.extra`,
      'garbage',
      '',
      await signMark(NOW, other),
    ];
    for (const value of refused) {
      expect(await verifyMark(value, key, NOW), value).toBeNull();
    }

    // Future-dated beyond five minutes of clock skew.
    expect(
      await verifyMark(await signMark(NOW + 301_000, key), key, NOW),
    ).toBeNull();
    expect(
      await verifyMark(await signMark(NOW + 299_000, key), key, NOW),
    ).not.toBeNull();
    // Older than 400 days.
    expect(
      await verifyMark(mark, key, NOW + (MAX_AGE_CAP_S + 1) * 1000),
    ).toBeNull();
    // After the walk is over, nobody is a guest.
    const late = await signMark(MARK_END - DAY, key);
    expect(await verifyMark(late, key, MARK_END - 1)).not.toBeNull();
    expect(await verifyMark(late, key, MARK_END)).toBeNull();
  });

  test('the cookie is __Host-, Secure, HttpOnly, SameSite=Lax and ends with the walk', () => {
    const cookie = guestCookie('g1.x.y', NOW);

    expect(GUEST_COOKIE.startsWith('__Host-')).toBe(true);
    expect(cookie).toBe(
      `${GUEST_COOKIE}=g1.x.y; Max-Age=${MAX_AGE_CAP_S}; Path=/; Secure; HttpOnly; SameSite=Lax`,
    );
    expect(guestCookie('v', MARK_END - 10 * DAY)).toContain(
      `Max-Age=${10 * 86_400};`,
    );
  });

  test('readCookie finds the mark among other cookies', () => {
    expect(readCookie(`a=1; ${GUEST_COOKIE}=g1.x.y; b=2`, GUEST_COOKIE)).toBe(
      'g1.x.y',
    );
    expect(readCookie('a=1', GUEST_COOKIE)).toBeNull();
    expect(readCookie(null, GUEST_COOKIE)).toBeNull();
  });

  test('needsRefresh after 30 days', () => {
    expect(needsRefresh(NOW, NOW + 30 * DAY)).toBe(false);
    expect(needsRefresh(NOW, NOW + 30 * DAY + 1000)).toBe(true);
  });
});

describe('the invite words', () => {
  test('normaliseWords folds case, separators and encoding', () => {
    for (const raw of [
      'Otter Lantern Meadow Harbour',
      'otter-lantern-meadow-harbour',
      'OTTER_lantern.meadow+harbour',
      'otter%20lantern%20meadow%20harbour',
      '  otter,, lantern -- meadow harbour- ',
      'ｏｔｔｅｒ lantern meadow harbour',
    ]) {
      expect(normaliseWords(raw), raw).toBe('otter-lantern-meadow-harbour');
    }
    expect(normaliseWords('%E0%A4%A')).toBe('');
  });

  test('wordsMatch fails closed below 3 words or with no secret', async () => {
    expect(
      await wordsMatch('otter lantern meadow harbour', env.INVITE_WORDS),
    ).toBe(true);
    expect(await wordsMatch('otter lantern meadow', env.INVITE_WORDS)).toBe(
      false,
    );
    expect(await wordsMatch('-', undefined)).toBe(false);
    expect(await wordsMatch('', '')).toBe(false);
    expect(await wordsMatch('-', '-')).toBe(false);
    expect(await wordsMatch('otter lantern', 'otter lantern')).toBe(false);
    expect(await wordsMatch('a b c', 'a b c')).toBe(true);
  });
});
