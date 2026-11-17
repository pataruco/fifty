// Turns a request into a response. The clock comes in as `now`, so tests
// can walk through the seasons and the life of a guest mark.

import {
  emailAddress,
  type Lang,
  pathFor,
  renderPage,
  seasonAt,
  type Viewer,
} from '@fifty/shared';
import {
  GUEST_COOKIE,
  guestCookie,
  importMarkKey,
  needsRefresh,
  readCookie,
  signMark,
  verifyMark,
} from './guest-mark.ts';
import { wordsMatch } from './invite-words.ts';
import {
  htmlResponse,
  methodNotAllowed,
  redirectResponse,
} from './responses.ts';
import { matchRoute } from './routes.ts';

async function markKey(env: Env): Promise<CryptoKey | null> {
  try {
    return await importMarkKey(env.GUEST_KEY);
  } catch {
    console.error('GUEST_KEY is missing or too short: nobody can be a guest');
    return null;
  }
}

/** A guest sees the join buttons; without a valid address, they cannot. */
function guestViewer(env: Env): Viewer {
  try {
    return { kind: 'guest', joinEmail: emailAddress(env.JOIN_EMAIL) };
  } catch {
    console.error('JOIN_EMAIL is missing or invalid: guests see no buttons');
    return { kind: 'public' };
  }
}

export async function handle(
  request: Request,
  env: Env,
  now: number,
): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return methodNotAllowed();
  }
  const head = request.method === 'HEAD';
  const { pathname } = new URL(request.url);
  const match = matchRoute(pathname);
  if (match.kind === 'redirect') {
    return redirectResponse(match.location, 308);
  }

  const key = await markKey(env);
  const value = readCookie(request.headers.get('Cookie'), GUEST_COOKIE);
  const mark = key && value ? await verifyMark(value, key, now) : null;
  const home = (lang: Lang) => pathFor('home', lang);
  const season = seasonAt(now);

  if (match.kind === 'hello') {
    // A 303, never a 301: browsers keep a 301 and would skip the mark.
    if (key && (await wordsMatch(match.words, env.INVITE_WORDS))) {
      return redirectResponse(home(match.lang), 303, {
        setCookie: guestCookie(await signMark(now, key), now),
        cache: 'never-store',
      });
    }
    if (mark) {
      return redirectResponse(home(match.lang), 303, { cache: 'never-store' });
    }
    return htmlResponse(
      renderPage({
        page: 'invite-gone',
        lang: match.lang,
        season,
        viewer: { kind: 'public' },
        links: 'absolute',
        path: pathname,
      }),
      { cache: 'never-store', varyCookie: true, head },
    );
  }

  const page = renderPage({
    page: match.kind === 'page' ? match.page : 'not-found',
    lang: match.lang,
    season,
    viewer: mark ? guestViewer(env) : { kind: 'public' },
    links: 'absolute',
    path: pathname,
  });
  if (!mark || !key) {
    return htmlResponse(page, { cache: 'public-page', varyCookie: true, head });
  }
  const renewed = needsRefresh(mark.issuedAt, now)
    ? guestCookie(await signMark(now, key), now)
    : undefined;
  return htmlResponse(page, {
    cache: 'guest-page',
    varyCookie: true,
    head,
    ...(renewed === undefined ? {} : { setCookie: renewed }),
  });
}
