import { env } from 'cloudflare:workers';
import { emailAddress, messages } from '@fifty/shared';
import { describe, expect, test, vi } from 'vitest';
import {
  GUEST_COOKIE,
  importMarkKey,
  MARK_END,
  signMark,
} from '../src/guest-mark.ts';
import { handle } from '../src/handle.ts';
import { expectedHome, get, JOIN, ORIGIN } from './helpers.ts';

const DAY = 86_400_000;
const key = await importMarkKey(env.GUEST_KEY);
const PAGES = ['/', '/es/', '/nowhere/', '/es/nowhere/'];

/** The name=value part of a Set-Cookie header, ready to send back. */
function cookieFrom(response: Response): string | null {
  return response.headers.get('Set-Cookie')?.split(';')[0] ?? null;
}

async function guestCookie(now = Date.now()): Promise<string> {
  return `${GUEST_COOKIE}=${await signMark(now, key)}`;
}

function call(
  path: string,
  o: {
    cookie?: string;
    now?: number;
    env?: Partial<Record<keyof Env, unknown>>;
  } = {},
): Promise<Response> {
  const headers = new Headers();
  if (o.cookie) headers.set('Cookie', o.cookie);
  return handle(
    new Request(`${ORIGIN}${path}`, { headers }),
    { ...env, ...o.env } as Env,
    o.now ?? Date.now(),
  );
}

const isGuestPage = (body: string) => body.includes('data-join');

describe('guests', () => {
  test('the right words give a 303 to / with a __Host- cookie that is Secure, HttpOnly and SameSite=Lax', async () => {
    const response = await get('/hello/otter-lantern-meadow-harbour/', {
      redirect: 'manual',
    });
    const cookie = response.headers.get('Set-Cookie') ?? '';

    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(cookie).toMatch(new RegExp(`^${GUEST_COOKIE}=g1\\.`));
    expect(cookie).toContain('; Path=/;');
    expect(cookie).toContain('; Secure;');
    expect(cookie).toContain('; HttpOnly;');
    expect(cookie).toMatch(/; SameSite=Lax$/);

    const home = await get('/', {
      headers: { Cookie: cookieFrom(response) ?? '' },
    });
    expect(await home.text()).toBe(
      expectedHome('en', { kind: 'guest', joinEmail: emailAddress(JOIN) }),
    );
  });

  test('/es/hello/ lands on /es/', async () => {
    const response = await get('/es/hello/otter-lantern-meadow-harbour/', {
      redirect: 'manual',
    });

    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/es/');
    expect(cookieFrom(response)).not.toBeNull();
  });

  test('words match whatever the case and separators', async () => {
    for (const words of [
      'Otter-Lantern-Meadow-Harbour',
      'otter%20lantern%20meadow%20harbour',
      'OTTER_lantern.meadow+harbour',
      'otter-lantern-meadow-harbour',
    ]) {
      const response = await call(`/hello/${words}/`);

      expect(response.status, words).toBe(303);
      expect(cookieFrom(response), words).not.toBeNull();
    }
    // Without the closing slash too.
    expect((await call('/hello/otter-lantern-meadow-harbour')).status).toBe(
      303,
    );
  });

  test('other words give the old-link page as a 404, with no-store and no cookie', async () => {
    for (const path of ['/hello/old-words-here/', '/es/hello/otter/']) {
      const response = await call(path);
      const body = await response.text();
      const lang = path.startsWith('/es/') ? 'es' : 'en';

      expect(response.status, path).toBe(404);
      expect(body, path).toContain(messages[lang].errors.inviteGone.heading);
      expect(response.headers.get('Cache-Control'), path).toBe('no-store');
      expect(response.headers.get('Set-Cookie'), path).toBeNull();
    }
  });

  test('a guest opening an old link stays a guest', async () => {
    const cookie = await guestCookie();
    const response = await call('/hello/old-words-here/', { cookie });

    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/');
    expect(response.headers.get('Set-Cookie')).toBeNull();
    expect(isGuestPage(await (await call('/', { cookie })).text())).toBe(true);
  });

  test('a mark made before the words changed still works', async () => {
    const cookie = await guestCookie();
    const changed = { INVITE_WORDS: 'new words for everyone' };

    expect(
      isGuestPage(await (await call('/', { cookie, env: changed })).text()),
    ).toBe(true);
    expect(
      (await call('/hello/otter-lantern-meadow-harbour/', { env: changed }))
        .status,
    ).toBe(404);
  });

  test('tampered, future-dated, too old and post-MARK_END marks count as public', async () => {
    const now = Date.UTC(2027, 3, 1);
    const good = await signMark(now, key);
    const cases: [string, number][] = [
      [`${GUEST_COOKIE}=${good.slice(0, -2)}xx`, now],
      [`${GUEST_COOKIE}=${await signMark(now + DAY, key)}`, now],
      [`${GUEST_COOKIE}=${good}`, now + 401 * DAY],
      [`${GUEST_COOKIE}=${await signMark(MARK_END - DAY, key)}`, MARK_END + 1],
    ];
    for (const [cookie, at] of cases) {
      const response = await call('/', { cookie, now: at });

      expect(isGuestPage(await response.text()), cookie).toBe(false);
      expect(response.headers.get('Cache-Control'), cookie).toBe('no-cache');
      expect(response.headers.get('Set-Cookie'), cookie).toBeNull();
    }
  });

  test('a mark older than 30 days is renewed', async () => {
    const now = Date.UTC(2027, 6, 1);
    const old = `${GUEST_COOKIE}=${await signMark(now - 31 * DAY, key)}`;
    const recent = `${GUEST_COOKIE}=${await signMark(now - 29 * DAY, key)}`;

    const renewed = await call('/', { cookie: old, now });
    expect(cookieFrom(renewed)).toBe(
      `${GUEST_COOKIE}=${await signMark(now, key)}`,
    );
    expect(
      (await call('/', { cookie: recent, now })).headers.get('Set-Cookie'),
    ).toBeNull();
  });

  test('an unset, empty or two-word secret never matches, and /hello// and /hello/-/ are 404', async () => {
    const secrets = [undefined, '', '   ', 'otter lantern', '-'];
    const paths = [
      '/hello//',
      '/hello/-/',
      '/hello/otter-lantern/',
      '/hello/%20/',
      '/hello/undefined/',
    ];
    for (const INVITE_WORDS of secrets) {
      for (const path of paths) {
        const response = await call(path, { env: { INVITE_WORDS } });

        expect(response.status, `${INVITE_WORDS} ${path}`).toBe(404);
        expect(response.headers.get('Set-Cookie')).toBeNull();
      }
    }
    for (const path of ['/hello//', '/hello/-/']) {
      expect((await call(path)).status, path).toBe(404);
    }
  });

  test('a guest page is never cached', async () => {
    const cookie = await guestCookie();
    for (const path of PAGES) {
      for (const method of ['GET', 'HEAD']) {
        const response = await get(path, {
          method,
          headers: { Cookie: cookie },
        });

        expect(response.headers.get('Cache-Control'), path).toBe(
          'private, no-store',
        );
        expect(response.headers.get('Vary'), path).toBe('Cookie');
      }
    }
  });

  test('the guest cookie only rides on no-store responses', async () => {
    const now = Date.UTC(2027, 6, 1);
    const old = `${GUEST_COOKIE}=${await signMark(now - 40 * DAY, key)}`;
    const responses = [
      await call('/hello/otter-lantern-meadow-harbour/', { now }),
      await call('/es/hello/otter-lantern-meadow-harbour/', { now }),
      ...(await Promise.all(PAGES.map((p) => call(p, { cookie: old, now })))),
    ];
    for (const response of responses) {
      expect(response.headers.get('Set-Cookie')).not.toBeNull();
      expect(response.headers.get('Cache-Control')).toMatch(/\bno-store\b/);
    }
  });

  test('a guest with no join address configured sees the public page, never a 500', async () => {
    const cookie = await guestCookie();
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    for (const JOIN_EMAIL of [undefined, '', 'not an address', '<x@y.test>']) {
      const response = await call('/', { cookie, env: { JOIN_EMAIL } });

      expect(response.status).toBe(200);
      expect(await response.text()).toBe(expectedHome('en'));
      expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    }
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  test('a spring-2027 guest who visits monthly is still a guest on 28 May 2028', async () => {
    let now = Date.UTC(2027, 3, 10, 9);
    const first = await call('/hello/otter-lantern-meadow-harbour/', { now });
    let cookie = cookieFrom(first) ?? '';
    const lastDay = Date.UTC(2028, 4, 28, 12);

    while (now < lastDay) {
      now = Math.min(now + 31 * DAY, lastDay);
      const response = await call('/', { cookie, now });

      expect(
        isGuestPage(await response.text()),
        new Date(now).toISOString(),
      ).toBe(true);
      cookie = cookieFrom(response) ?? cookie;
    }
  });
});
