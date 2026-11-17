// The smoke test: run after each deploy, against the real site.
// Run: SMOKE_BASE_URL=https://fifty.pataruco.dev SMOKE_INVITE_WORDS=… \
//      node scripts/smoke.ts
//
// It compares the live public pages byte for byte with the renderer, so
// anything that rewrites them on the way (Email Address Obfuscation, an
// injected script) fails it, and it checks a guest page is never cached.

import { type Lang, pathFor, renderPage, seasonAt } from '@fifty/shared';

export interface SmokeResult {
  readonly name: string;
  readonly ok: boolean;
  readonly detail: string;
}

const GUEST_COOKIE = '__Host-fifty-guest';
const JOIN_BUTTONS = 5;

/** A check that throws, or whose fetch fails, is a failed check. */
async function check(
  name: string,
  run: () => Promise<string | true>,
): Promise<SmokeResult> {
  try {
    const outcome = await run();
    return outcome === true
      ? { name, ok: true, detail: 'ok' }
      : { name, ok: false, detail: outcome };
  } catch (error) {
    return { name, ok: false, detail: String(error) };
  }
}

export async function runSmoke(o: {
  readonly baseUrl: string;
  readonly inviteWords: string;
  readonly fetch?: typeof fetch;
  /** The moment to render for; the command line passes the clock. */
  readonly now: number;
}): Promise<readonly SmokeResult[]> {
  const doFetch = o.fetch ?? fetch;
  const { now } = o;
  const get = (path: string, cookie?: string) =>
    doFetch(new URL(path, o.baseUrl), {
      redirect: 'manual',
      headers: cookie ? { Cookie: cookie } : {},
    });
  const expected = (lang: Lang) =>
    renderPage({
      page: 'home',
      lang,
      season: seasonAt(now),
      viewer: { kind: 'public' },
      links: 'absolute',
      path: pathFor('home', lang),
    }).html;

  const results: SmokeResult[] = [];
  const bodies = new Map<Lang, string>();

  for (const lang of ['en', 'es'] as const) {
    const path = pathFor('home', lang);
    results.push(
      await check(`${path} equals the renderer`, async () => {
        const response = await get(path);
        const body = await response.text();
        bodies.set(lang, body);
        if (response.status !== 200) return `status ${response.status}`;
        return body === expected(lang) || 'the HTML differs from renderPage';
      }),
    );
  }
  for (const lang of ['en', 'es'] as const) {
    const path = pathFor('home', lang);
    results.push(
      await check(
        `${path} has no script, /cdn-cgi/ or join button`,
        async () => {
          const body = bodies.get(lang);
          if (body === undefined) return 'the page could not be read';
          const found = ['<script', '/cdn-cgi/', 'data-join'].filter((s) =>
            body.includes(s),
          );
          return found.length === 0 || `found ${found.join(', ')}`;
        },
      ),
    );
  }

  results.push(
    await check('random words get a 404 and no cookie', async () => {
      const random = [...crypto.getRandomValues(new Uint8Array(6))]
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('-');
      const response = await get(`/hello/smoke-${random}/`);
      if (response.status !== 404) return `status ${response.status}`;
      return response.headers.get('Set-Cookie') === null || 'a cookie was set';
    }),
  );

  let cookie: string | undefined;
  const words = o.inviteWords.trim().split(/\s+/).join('-');
  results.push(
    await check('the real words get a 303 and the guest cookie', async () => {
      const response = await get(`/hello/${encodeURIComponent(words)}/`);
      if (response.status !== 303) return `status ${response.status}`;
      const pair = response.headers.get('Set-Cookie')?.split(';')[0];
      if (!pair?.startsWith(`${GUEST_COOKIE}=`)) return 'no guest cookie';
      cookie = pair;
      return true;
    }),
  );

  let guestBody: string | undefined;
  results.push(
    await check(
      'the guest page is private, no-store and not from a cache',
      async () => {
        if (!cookie) return 'no guest cookie to send';
        const response = await get('/', cookie);
        guestBody = await response.text();
        const cache = response.headers.get('Cache-Control');
        if (cache !== 'private, no-store') return `Cache-Control: ${cache}`;
        const status = response.headers.get('CF-Cache-Status');
        return status !== 'HIT' || 'CF-Cache-Status: HIT';
      },
    ),
  );
  results.push(
    await check(`the guest page has ${JOIN_BUTTONS} join buttons`, async () => {
      if (guestBody === undefined) return 'no guest page to read';
      const buttons = guestBody.match(
        /<a\b[^>]*href="mailto:[^"]+"[^>]*data-join="/g,
      );
      const count = buttons?.length ?? 0;
      return count === JOIN_BUTTONS || `found ${count}`;
    }),
  );

  results.push(
    await check(
      'a public request after the guest one gets the public page',
      async () => {
        const response = await get('/');
        const body = await response.text();
        return body === expected('en') || 'the HTML differs from renderPage';
      },
    ),
  );

  return results;
}

if (import.meta.main) {
  const baseUrl = process.env.SMOKE_BASE_URL;
  const inviteWords = process.env.SMOKE_INVITE_WORDS;
  if (!baseUrl || !inviteWords) {
    process.stderr.write('Set SMOKE_BASE_URL and SMOKE_INVITE_WORDS.\n');
    process.exit(2);
  }
  // Like the Worker's entry point, the command line reads the clock.
  const results = await runSmoke({ baseUrl, inviteWords, now: Date.now() });
  for (const r of results) {
    process.stdout.write(`${r.ok ? '✓' : '✗'} ${r.name}: ${r.detail}\n`);
  }
  if (results.some((r) => !r.ok)) process.exit(1);
}
