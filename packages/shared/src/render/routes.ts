// Page addresses. English lives at /, Spanish at /es/, and every page has
// a counterpart at the same path in the other language.

import type { Lang } from '../i18n/lang.ts';

export type PageId = 'home' | 'not-found' | 'invite-gone';

/** The pages that exist as addresses. The error pages are answers. */
export const BUILT_PAGES = ['home'] as const;
export type BuiltPage = (typeof BUILT_PAGES)[number];

export function pathFor(page: BuiltPage, lang: Lang): '/' | '/es/' {
  switch (page) {
    case 'home':
      return lang === 'es' ? '/es/' : '/';
  }
}

export function langOfPath(path: string): Lang {
  return path === '/es' || path.startsWith('/es/') ? 'es' : 'en';
}

/** The same page in the other language. */
export function counterpartPath(path: string): string {
  return langOfPath(path) === 'es'
    ? path.slice('/es'.length) || '/'
    : `/es${path}`;
}
