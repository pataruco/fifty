// Every response the Worker makes goes through here, so each one carries
// the same safety headers.

import { contentSecurityPolicy, type RenderedPage } from '@fifty/shared';

export type CachePolicy = 'public-page' | 'guest-page' | 'never-store';

export const CACHE_CONTROL: Readonly<Record<CachePolicy, string>> = {
  /** Kept, but checked every time, so a new guest never gets it. */
  'public-page': 'no-cache',
  /** Made for one device; never kept anywhere. */
  'guest-page': 'private, no-store',
  /** Sets or depends on the guest mark. */
  'never-store': 'no-store',
};

function baseHeaders(): Headers {
  return new Headers({
    'X-Robots-Tag': 'noindex, nofollow',
    // The invite words can sit in the address.
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
  });
}

export function htmlResponse(
  page: RenderedPage,
  o: {
    readonly cache: CachePolicy;
    readonly varyCookie: boolean;
    readonly setCookie?: string;
    readonly head: boolean;
  },
): Response {
  const headers = baseHeaders();
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Content-Security-Policy', contentSecurityPolicy());
  headers.set('Cache-Control', CACHE_CONTROL[o.cache]);
  if (o.varyCookie) headers.set('Vary', 'Cookie');
  if (o.setCookie !== undefined) headers.set('Set-Cookie', o.setCookie);
  return new Response(o.head ? null : page.html, {
    status: page.status,
    headers,
  });
}

export function redirectResponse(
  location: string,
  status: 303 | 308,
  o: { readonly setCookie?: string; readonly cache?: CachePolicy } = {},
): Response {
  const headers = baseHeaders();
  headers.set('Location', location);
  if (o.cache !== undefined)
    headers.set('Cache-Control', CACHE_CONTROL[o.cache]);
  if (o.setCookie !== undefined) headers.set('Set-Cookie', o.setCookie);
  return new Response(null, { status, headers });
}

export function methodNotAllowed(): Response {
  const headers = baseHeaders();
  headers.set('Allow', 'GET, HEAD');
  headers.set('Content-Type', 'text/plain; charset=utf-8');
  headers.set('Cache-Control', CACHE_CONTROL['never-store']);
  return new Response('Method not allowed\n', { status: 405, headers });
}
