// Turns a request into a response. The clock comes in as `now`, so tests
// can walk through the seasons.

import { renderPage, seasonAt } from '@fifty/shared';
import {
  htmlResponse,
  methodNotAllowed,
  redirectResponse,
} from './responses.ts';
import { matchRoute } from './routes.ts';

export async function handle(
  request: Request,
  _env: Env,
  now: number,
): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return methodNotAllowed();
  }
  const head = request.method === 'HEAD';
  const { pathname } = new URL(request.url);
  const match = matchRoute(pathname);
  const common = {
    season: seasonAt(now),
    viewer: { kind: 'public' },
    links: 'absolute',
    path: pathname,
  } as const;

  switch (match.kind) {
    case 'redirect':
      return redirectResponse(match.location, 308);
    case 'page':
      return htmlResponse(
        renderPage({ ...common, page: match.page, lang: match.lang }),
        { cache: 'public-page', varyCookie: true, head },
      );
    case 'not-found':
      return htmlResponse(
        renderPage({ ...common, page: 'not-found', lang: match.lang }),
        { cache: 'public-page', varyCookie: true, head },
      );
  }
}
